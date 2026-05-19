import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { AsaasService } from './asaas.service';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private asaasService: AsaasService,
  ) {}

  async createCheckoutSession(data: {
    subscriptionId: string;
    planId: string;
    planName: string;
    amount: number;
    interval: 'month' | 'year';
    companyId: string;
    email: string;
  }) {
    return this.stripeService.createCheckoutSession(data);
  }

  async createAsaasPayment(data: {
    subscriptionId: string;
    customerName: string;
    customerEmail: string;
    customerCpfCnpj?: string;
    amount: number;
    dueDate: string;
    description: string;
    billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  }) {
    return this.asaasService.createPayment(data);
  }

  async confirmPayment(paymentId: string, gatewayId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { subscription: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'CONFIRMED', paidAt: new Date(), gatewayId },
    });

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });

    return { message: 'Payment confirmed' };
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    const event = await this.stripeService.constructWebhookEvent(payload, signature);
    return this.stripeService.handleWebhookEvent(event);
  }

  async handleAsaasWebhook(payload: any) {
    return this.asaasService.handleWebhook(payload);
  }

  async handleWebhook(gateway: string, payload: any) {
    if (gateway === 'stripe') {
      return this.handleStripeWebhook(payload, '');
    }
    if (gateway === 'asaas') {
      return this.handleAsaasWebhook(payload);
    }
    throw new BadRequestException('Unknown gateway');
  }

  async getPayments(subscriptionId: string) {
    return this.prisma.payment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllPayments(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            include: {
              company: { select: { name: true } },
              plan: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.payment.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllSubscriptions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              user: { select: { email: true } },
            },
          },
          plan: { select: { id: true, name: true, priceMonthly: true } },
          payments: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.subscription.count(),
    ]);
    const mapped = data.map((sub) => ({
      ...sub,
      company: sub.company
        ? { ...sub.company, email: sub.company.user?.email }
        : undefined,
    }));
    return { data: mapped, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getSubscriptionSummary() {
    const [total, active, trial, expired, revenue] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { status: 'TRIAL' } }),
      this.prisma.subscription.count({ where: { status: 'EXPIRED' } }),
      this.prisma.payment.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { amount: true },
      }),
    ]);
    return { total, active, trial, expired, revenue: revenue._sum.amount || 0 };
  }
}
