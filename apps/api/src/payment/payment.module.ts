import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { StripeService } from './stripe.service';
import { AsaasService } from './asaas.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, StripeService, AsaasService],
  exports: [PaymentService],
})
export class PaymentModule {}
