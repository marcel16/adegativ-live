import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TVService } from './tv.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/tv',
})
export class TVPairingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedTVs = new Map<string, string>();

  constructor(private tvService: TVService) {}

  handleConnection(client: Socket) {
    console.log(`TV client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [tvId, socketId] of this.connectedTVs.entries()) {
      if (socketId === client.id) {
        this.connectedTVs.delete(tvId);
        this.tvService.markOffline();
        break;
      }
    }
    console.log(`TV client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(@ConnectedSocket() client: Socket, @MessageBody() data: { deviceToken: string }) {
    this.connectedTVs.set(data.deviceToken, client.id);
    client.join(`tv:${data.deviceToken}`);
    return { event: 'registered', data: { status: 'ok' } };
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: { deviceToken: string }) {
    this.tvService.pingTV(data.deviceToken);
    return { event: 'pong', data: { status: 'ok' } };
  }

  @SubscribeMessage('getPlaylist')
  async handleGetPlaylist(@MessageBody() data: { deviceToken: string }) {
    try {
      const playlist = await this.tvService.getPlaylistForTV(data.deviceToken);
      return { event: 'playlist', data: playlist };
    } catch (err) {
      return { event: 'error', data: { message: err.message } };
    }
  }

  async notifyTVUpdate(deviceToken: string) {
    this.server.to(`tv:${deviceToken}`).emit('contentUpdate', { timestamp: new Date().toISOString() });
  }

  async notifyAllTVs(adegaId: string) {
    // Implementation could be extended to notify all TVs in an adega
  }
}
