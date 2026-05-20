import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdegaModule } from './adega/adega.module';
import { TVModule } from './tv/tv.module';
import { PlansModule } from './plans/plans.module';
import { MediaModule } from './media/media.module';
import { ScheduleModule } from './schedule/schedule.module';
import { PlaylistModule } from './playlist/playlist.module';
import { CampaignModule } from './campaign/campaign.module';
import { WebSocketModule } from './websocket/websocket.module';
import { PaymentModule } from './payment/payment.module';
import { SettingsModule } from './settings/settings.module';
import { StreamModule } from './stream/stream.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    SettingsModule,
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'),
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    AdegaModule,
    TVModule,
    PlansModule,
    MediaModule,
    ScheduleModule,
    PlaylistModule,
    CampaignModule,
    WebSocketModule,
    PaymentModule,
    StreamModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
