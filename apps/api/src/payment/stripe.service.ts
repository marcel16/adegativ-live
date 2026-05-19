import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe: any;

  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
  ) {}

  async onModuleInit() {
    const secretKey = await this.settings.get('stripe_secret_key');
    if (secretKey) {
      const Stripe = require('stripe');
      this.stripe = new Stripe(secretKey, { apiVersion: '2024-11-20.acacia' });
    }
  }

  private async getStripe() {
    if (this.stripe) return this.stripe;
    const secretKey = await this.settings.get('stripe_secret_key');
    if (!secretKey) throw new BadRequestException('Stripe not configured');
    const Stripe = require('stripe');
    this.stripe = new Stripe(secretKey, { apiVersion: '2024-11-20.acacia' });
    return this.stripe;
  }

  private async getWebhookSecret(): Promise<string> {
    const secret = await this.settings.get('stripe_webhook_secret');
    if (!secret) throw new BadRequestException('Stripe webhook secret not configured');
    return secret;
  }

  async createCheckoutSession(data: {
    subscriptionId: string;
    planId: string;
    planName: string;
    amount: number;
    interval: 'month' | 'year';
    companyId: string;
    email: string;
  }) {
    const stripe = await this.getStripe();
    const appUrl = await this.settings.getWithDefault('app_url', 'http://localhost:8080');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name: data.planName },
            recurring: { interval: data.interval },
            unit_amount: Math.round(data.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        subscriptionId: data.subscriptionId,
        companyId: data.companyId,
      },
      customer_email: data.email,
      success_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/dashboard/planos?payment=cancelled`,
    });

    await this.prisma.payment.create({
      data: {
        subscriptionId: data.subscriptionId,
        gateway: 'STRIPE',
        gatewayId: session.id,
        amount: data.amount,
        currency: 'BRL',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  async constructWebhookEvent(payload: Buffer, signature: string) {
    const stripe = await this.getStripe();
    const webhookSecret = await this.getWebhookSecret();
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async handleWebhookEvent(event: any) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription') {
          await this.handleSubscriptionCreated(session);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await this.handleInvoicePaid(invoice);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await this.handleSubscriptionUpdated(sub);
        break;
      }
    }
    return { received: true };
  }

  private async handleSubscriptionCreated(session: any) {
    const subscriptionId = session.metadata?.subscriptionId;
    if (!subscriptionId) return;

    const stripeSubscriptionId = session.subscription;
    const paymentIntentId = session.payment_intent;

    await this.prisma.payment.updateMany({
      where: { gatewayId: session.id, subscriptionId },
      data: {
        gatewayId: stripeSubscriptionId || session.id,
        status: 'CONFIRMED',
        paidAt: new Date(),
        paymentMethod: 'credit_card',
      },
    });

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });
  }

  private async handleInvoicePaid(invoice: any) {
    const stripeSubscriptionId = invoice.subscription;
    if (!stripeSubscriptionId) return;

    const payment = await this.prisma.payment.findFirst({
      where: { gatewayId: stripeSubscriptionId as string, status: 'PENDING' },
      include: { subscription: true },
    });

    if (!payment) return;

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'CONFIRMED', paidAt: new Date(), paymentMethod: 'credit_card' },
    });

    await this.prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });
  }

  private async handleSubscriptionUpdated(subscription: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayId: subscription.id as string },
      include: { subscription: true },
    });

    if (!payment) return;

    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      await this.prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: 'EXPIRED' },
      });
    }
  }
}
