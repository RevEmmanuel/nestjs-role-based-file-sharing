import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WinstonLogger } from '../../../config/winston.logger';

@WebSocketGateway({ cors: true, namespace: '/websocket-connect' })
export class FilesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new WinstonLogger(FilesGateway.name);

  // Map userId -> socket.id[]
  private readonly userSockets = new Map<string, string[]>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }

    const sockets = this.userSockets.get(userId) || [];
    this.userSockets.set(userId, [...sockets, client.id]);
    this.logger.log(`User ${userId} connected with socket ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketIds] of this.userSockets.entries()) {
      const filtered = socketIds.filter((id) => id !== client.id);
      if (filtered.length === 0) {
        this.userSockets.delete(userId);
      } else {
        this.userSockets.set(userId, filtered);
      }
    }
    this.logger.log(`Socket ${client.id} disconnected`);
  }

  // Broadcast to all users
  broadcastNewFile(file: any) {
    this.server.emit('file.new', file);
  }

  // Notify specific user
  notifyOwnerMetadataUpdate(userId: string, file: any) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    sockets.forEach((socketId) => {
      this.server.to(socketId).emit('file.metadataUpdated', file);
    });
  }
}
