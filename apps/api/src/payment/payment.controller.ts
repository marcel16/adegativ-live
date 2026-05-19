import {
  Controller, Post, Get, Body, Param, Query, UseGuards,
  HttpCode, HttpStatus, Headers, Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Request } from 'express';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('checkout/stripe')
  @UseGuards(JwtAuthGuard)
  createStripeCheckout(
    @Body() data: {
      subscriptionId: string;
      planId: string;
      planName: string;
      amount: number;
      interval: 'month' | 'year';
      companyId: string;
      email: string;
    },
  ) {
    return this.paymentService.createCheckoutSession(data);
  }

  @Post('checkout/asaas')
  @UseGuards(JwtAuthGuard)
  createAsaasPayment(
    @Body() data: {
      subscriptionId: string;
      customerName: string;
      customerEmail: string;
      customerCpfCnpj?: string;
      amount: number;
      dueDate: string;
      description: string;
      billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
    },
  ) {
    return this.paymentService.createAsaasPayment(data);
  }

  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  async stripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    return this.paymentService.handleStripeWebhook(
      Buffer.from(rawBody),
      signature,
    );
  }

  @Post('webhook/asaas')
  @HttpCode(HttpStatus.OK)
  asaasWebhook(@Body() payload: any) {
    return this.paymentService.handleAsaasWebhook(payload);
  }

  @Post('webhook/:gateway')
  @HttpCode(HttpStatus.OK)
  webhook(@Param('gateway') gateway: string, @Body() payload: any) {
    return this.paymentService.handleWebhook(gateway, payload);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  confirm(@Param('id') id: string, @Body('gatewayId') gatewayId: string) {
    return this.paymentService.confirmPayment(id, gatewayId);
  }

  @Get('subscription/:subscriptionId')
  @UseGuards(JwtAuthGuard)
  getPayments(@Param('subscriptionId') subscriptionId: string) {
    return this.paymentService.getPayments(subscriptionId);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, AdminGuard)
  listPayments(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.paymentService.getAllPayments(Number(page), Number(limit));
  }

  @Get('admin/subscriptions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  listSubscriptions(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.paymentService.getAllSubscriptions(Number(page), Number(limit));
  }

  @Get('admin/summary')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getSummary() {
    return this.paymentService.getSubscriptionSummary();
  }
}
