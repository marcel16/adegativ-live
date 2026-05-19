import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WSGateway({
  cors: { origin: '*', credentials: true },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      sockets.delete(client.id);
      if (sockets.size === 0) this.userSockets.delete(userId);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('auth')
  handleAuth(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    const userId = data.userId;
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    client.join(`user:${userId}`);
    return { event: 'authenticated', data: { status: 'ok' } };
  }

  @SubscribeMessage('joinAdega')
  handleJoinAdega(@ConnectedSocket() client: Socket, @MessageBody() data: { adegaId: string }) {
    client.join(`adega:${data.adegaId}`);
    return { event: 'joined', data: { adegaId: data.adegaId } };
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToAdega(adegaId: string, event: string, data: any) {
    this.server.to(`adega:${adegaId}`).emit(event, data);
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
