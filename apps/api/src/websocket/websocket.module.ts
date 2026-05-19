import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { TVModule } from '../tv/tv.module';

@Module({
  imports: [TVModule],
  providers: [WebSocketGateway],
})
export class WebSocketModule {}
