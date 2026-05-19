import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AsaasService implements OnModuleInit {
  private apiKey: string | null = null;
  private baseUrl: string;

  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
  ) {
    this.baseUrl = 'https://sandbox.asaas.com/api/v3';
  }

  async onModuleInit() {
    this.apiKey = await this.settings.get('asaas_api_key');
    const env = await this.settings.getWithDefault('asaas_env', 'sandbox');
    this.baseUrl = env === 'production'
      ? 'https://api.asaas.com/v3'
      : 'https://sandbox.asaas.com/api/v3';
  }

  private async ensureInitialized() {
    if (this.apiKey) return;
    this.apiKey = await this.settings.get('asaas_api_key');
    if (!this.apiKey) throw new BadRequestException('Asaas not configured');
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'access_token': this.apiKey || '',
    };
  }

  private async request(method: string, path: string, body?: any) {
    await this.ensureInitialized();

    const https = await import('https');
    return new Promise<any>((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${path}`);
      const options: any = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method,
        headers: this.headers,
        timeout: 10000,
      };

      const req = https.request(options, (res: any) => {
        let data = '';
        res.on('data', (chunk: string) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 400) {
              reject(new BadRequestException(parsed.errors?.[0]?.description || 'Asaas API error'));
            } else {
              resolve(parsed);
            }
          } catch {
            resolve(data);
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async createPayment(data: {
    subscriptionId: string;
    customerCpfCnpj?: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    dueDate: string;
    description: string;
    billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  }) {
    const customer = await this.findOrCreateCustomer({
      name: data.customerName,
      email: data.customerEmail,
      cpfCnpj: data.customerCpfCnpj || '00000000000',
    });

    const payment = await this.request('POST', '/payments', {
      customer: customer.id,
      billingType: data.billingType,
      value: data.amount,
      dueDate: data.dueDate,
      description: data.description,
      postalService: false,
    });

    await this.prisma.payment.create({
      data: {
        subscriptionId: data.subscriptionId,
        gateway: 'ASAAS',
        gatewayId: payment.id,
        amount: data.amount,
        currency: 'BRL',
        status: 'PENDING',
        paymentMethod: data.billingType.toLowerCase(),
        invoiceUrl: payment.invoiceUrl || payment.bankSlipUrl,
        dueDate: new Date(data.dueDate),
      },
    });

    return {
      id: payment.id,
      invoiceUrl: payment.invoiceUrl || payment.bankSlipUrl,
      pixQrCode: payment.pixQrCode || null,
      pixCopyPaste: payment.pixCopyPasteKey || null,
      status: payment.status,
      dueDate: payment.dueDate,
    };
  }

  private async findOrCreateCustomer(data: { name: string; email: string; cpfCnpj: string }) {
    const list = await this.request('GET', `/customers?email=${encodeURIComponent(data.email)}&limit=1`);
    if (list.data?.length > 0) return list.data[0];

    return this.request('POST', '/customers', {
      name: data.name,
      email: data.email,
      cpfCnpj: data.cpfCnpj,
    });
  }

  async handleWebhook(body: any) {
    const event = body.event;
    if (!event) return { received: true };

    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED': {
        const paymentData = body.payment;
        if (paymentData?.id) {
          await this.confirmAsaasPayment(paymentData.id);
        }
        break;
      }
      case 'PAYMENT_OVERDUE':
      case 'PAYMENT_DELETED': {
        const pData = body.payment;
        if (pData?.id) {
          await this.cancelAsaasPayment(pData.id);
        }
        break;
      }
    }

    return { received: true };
  }

  private async confirmAsaasPayment(asaasPaymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayId: asaasPaymentId },
      include: { subscription: true },
    });

    if (!payment) return;

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'CONFIRMED', paidAt: new Date() },
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

  private async cancelAsaasPayment(asaasPaymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayId: asaasPaymentId },
    });
    if (!payment) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'CANCELLED' },
    });
  }
}
