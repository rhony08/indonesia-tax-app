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
import { JwtService } from '@nestjs/jwt';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';
import { db, schema } from '../../database/database';

const { consultations, messages, consultants } = schema;

interface JwtPayload {
  sub: string;
  id?: string;
  email: string;
  role: string;
}

interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Verify JWT token on connection and join the user to their personal room.
   */
  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(`Connection rejected: no token from ${client.id}`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload: JwtPayload = await this.jwtService.verifyAsync(token);
      client.user = payload;

      const userId = payload.sub ?? payload.id ?? '';
      if (!userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Join user to their personal room
      await client.join(`user:${userId}`);

      this.logger.log(
        `Client connected: ${client.id} (user: ${userId}, role: ${payload.role})`,
      );

      client.emit('connected', {
        message: 'Connected to chat server',
        userId,
      });
    } catch (error) {
      this.logger.error(
        `Connection failed for ${client.id}: ${(error as Error).message}`,
      );
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection.
   */
  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.user?.sub ?? client.user?.id ?? 'unknown';
    this.logger.log(`Client disconnected: ${client.id} (user: ${userId})`);
  }

  /**
   * Join a consultation room.
   * The user must be a participant in the consultation.
   */
  @SubscribeMessage('join-consultation')
  async handleJoinConsultation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { consultationId: string },
  ): Promise<void> {
    const userId = this.getUserId(client);

    if (!data?.consultationId) {
      client.emit('error', { message: 'consultationId is required' });
      return;
    }

    const isParticipant = await this.checkParticipant(
      data.consultationId,
      userId,
    );

    if (!isParticipant) {
      client.emit('error', {
        message: 'You are not a participant in this consultation',
      });
      return;
    }

    const room = `consultation:${data.consultationId}`;
    await client.join(room);

    this.logger.log(
      `User ${userId} joined consultation room ${data.consultationId}`,
    );

    client.emit('joined-consultation', {
      consultationId: data.consultationId,
      message: 'Successfully joined consultation room',
    });
  }

  /**
   * Leave a consultation room.
   */
  @SubscribeMessage('leave-consultation')
  async handleLeaveConsultation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { consultationId: string },
  ): Promise<void> {
    if (!data?.consultationId) {
      client.emit('error', { message: 'consultationId is required' });
      return;
    }

    const room = `consultation:${data.consultationId}`;
    await client.leave(room);

    this.logger.log(
      `User ${this.getUserId(client)} left consultation room ${data.consultationId}`,
    );

    client.emit('left-consultation', {
      consultationId: data.consultationId,
      message: 'Left consultation room',
    });
  }

  /**
   * Send a message in a consultation room.
   * Persists to DB and broadcasts to all participants in the room.
   */
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      consultationId: string;
      content: string;
      type?: string;
      file_url?: string;
      file_name?: string;
    },
  ): Promise<void> {
    const userId = this.getUserId(client);

    if (!data?.consultationId || !data?.content) {
      client.emit('error', {
        message: 'consultationId and content are required',
      });
      return;
    }

    const isParticipant = await this.checkParticipant(
      data.consultationId,
      userId,
    );

    if (!isParticipant) {
      client.emit('error', {
        message: 'You are not a participant in this consultation',
      });
      return;
    }

    // Check consultation is active
    const consultationResult = await db
      .select({ status: consultations.status })
      .from(consultations)
      .where(eq(consultations.id, data.consultationId))
      .limit(1);

    if (
      !consultationResult.length ||
      consultationResult[0].status !== 'active'
    ) {
      client.emit('error', {
        message: 'Cannot send messages to a consultation that is not active',
      });
      return;
    }

    const messageId = uuidv4();
    const now = new Date().toISOString();
    const messageType = data.type || 'text';

    // Save message to database
    await db.insert(messages).values({
      id: messageId,
      consultation_id: data.consultationId,
      sender_id: userId,
      content: data.content,
      type: messageType,
      file_url: data.file_url || null,
      file_name: data.file_name || null,
      is_read: false,
      created_at: now,
    });

    const messagePayload = {
      id: messageId,
      consultation_id: data.consultationId,
      sender_id: userId,
      content: data.content,
      type: messageType,
      file_url: data.file_url || null,
      file_name: data.file_name || null,
      is_read: false,
      created_at: now,
    };

    // Broadcast to consultation room (including sender for confirmation)
    const room = `consultation:${data.consultationId}`;
    this.server.to(room).emit('new-message', messagePayload);

    this.logger.log(
      `Message sent in consultation ${data.consultationId} by user ${userId}`,
    );
  }

  /**
   * Broadcast typing indicator to a consultation room.
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { consultationId: string; isTyping: boolean },
  ): void {
    const userId = this.getUserId(client);

    if (!data?.consultationId) {
      client.emit('error', { message: 'consultationId is required' });
      return;
    }

    const room = `consultation:${data.consultationId}`;

    // Broadcast typing status to everyone else in the room
    client.to(room).emit('user-typing', {
      userId,
      consultationId: data.consultationId,
      isTyping: data.isTyping ?? true,
    });
  }

  /**
   * Mark messages as read.
   */
  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { consultationId: string; messageIds?: string[] },
  ): Promise<void> {
    const userId = this.getUserId(client);

    if (!data?.consultationId) {
      client.emit('error', { message: 'consultationId is required' });
      return;
    }

    const isParticipant = await this.checkParticipant(
      data.consultationId,
      userId,
    );

    if (!isParticipant) {
      client.emit('error', {
        message: 'You are not a participant in this consultation',
      });
      return;
    }

    if (data.messageIds && data.messageIds.length > 0) {
      // Mark specific messages as read
      for (const msgId of data.messageIds) {
        await db
          .update(messages)
          .set({ is_read: true })
          .where(
            and(
              eq(messages.id, msgId),
              eq(messages.consultation_id, data.consultationId),
            ),
          );
      }
    } else {
      // Mark all unread messages in this consultation as read (except own messages)
      await db
        .update(messages)
        .set({ is_read: true })
        .where(
          and(
            eq(messages.consultation_id, data.consultationId),
            eq(messages.is_read, false),
          ),
        );
    }

    // Notify room that messages were read
    const room = `consultation:${data.consultationId}`;
    this.server.to(room).emit('messages-read', {
      userId,
      consultationId: data.consultationId,
      messageIds: data.messageIds || [],
    });

    this.logger.log(
      `Messages marked as read in consultation ${data.consultationId} by user ${userId}`,
    );
  }

  /**
   * Extract JWT token from the Socket handshake.
   */
  private extractToken(client: Socket): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rawToken: string | undefined =
      client.handshake.auth?.token || client.handshake.query?.token;

    if (!rawToken) {
      return undefined;
    }

    if (rawToken.startsWith('Bearer ')) {
      return rawToken.split(' ')[1];
    }

    return rawToken;
  }

  /**
   * Get the user ID from the authenticated socket.
   */
  private getUserId(client: AuthenticatedSocket): string {
    if (!client.user) {
      throw new UnauthorizedException('Not authenticated');
    }
    return client.user.sub ?? client.user.id ?? '';
  }

  /**
   * Check if a user is a participant in a consultation.
   * A user is a participant if they are the client (user_id) or the consultant.
   */
  private async checkParticipant(
    consultationId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await db
      .select()
      .from(consultations)
      .where(eq(consultations.id, consultationId))
      .limit(1);

    if (!result.length) {
      return false;
    }

    const consultation = result[0];

    // Check if user is the client
    if (consultation.user_id === userId) {
      return true;
    }

    // Check if user is the consultant (look up their consultant profile)
    const consultantResult = await db
      .select({ id: consultants.id })
      .from(consultants)
      .where(eq(consultants.user_id, userId))
      .limit(1);

    if (
      consultantResult.length > 0 &&
      consultation.consultant_id === consultantResult[0].id
    ) {
      return true;
    }

    return false;
  }
}
