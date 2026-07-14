import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

/**
 * Minimum interface representing a Socket.io client for token extraction.
 * Avoids a direct dependency on 'socket.io' which may not be hoisted in pnpm.
 */
interface WsClient {
  handshake: {
    auth: { token?: string };
    query: { token?: string };
  };
  data: Record<string, unknown>;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<WsClient>();
    const token = this.extractTokenFromHandshake(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload: Record<string, unknown> =
        await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHandshake(client: WsClient): string | undefined {
    const rawToken =
      client.handshake.auth?.token || client.handshake.query?.token;

    if (!rawToken) {
      return undefined;
    }

    // Accept Bearer token or raw JWT
    if (typeof rawToken === 'string' && rawToken.startsWith('Bearer ')) {
      return rawToken.split(' ')[1];
    }

    return rawToken;
  }
}
