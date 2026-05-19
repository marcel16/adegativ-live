import { Module } from '@nestjs/common';
import { TVService } from './tv.service';
import { TVController } from './tv.controller';
import { TVPairingGateway } from './tv-pairing.gateway';

@Module({
  controllers: [TVController],
  providers: [TVService, TVPairingGateway],
  exports: [TVService, TVPairingGateway],
})
export class TVModule {}
