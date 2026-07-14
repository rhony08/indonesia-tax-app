import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../database/database';
import { RegisterDto } from './dto/register.dto';
import {
  AuthTokensResponse,
  UserProfileResponse,
} from './dto/auth-response.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 86400;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return 86400;
  }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokensResponse> {
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.email, dto.email),
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userId = uuidv4();
    const now = new Date().toISOString();

    await db.insert(schema.users).values({
      id: userId,
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      phone: dto.phone ?? null,
      npwp: dto.npwp ?? null,
      role: 'user',
      created_at: now,
      updated_at: now,
    });

    this.logger.log(`New user registered: ${dto.email}`);

    return this.generateTokens(userId, dto.email, 'user');
  }

  async login(email: string, password: string): Promise<AuthTokensResponse> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please login with Google.',
      );
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`User logged in: ${email}`);

    return this.generateTokens(user.id, user.email, user.role);
  }

  generateTokens(
    userId: string,
    email: string,
    role: string,
  ): AuthTokensResponse {
    const payload: JwtPayload = { sub: userId, email, role };

    const accessExpiration = this.configService.get<string>(
      'jwt.expiration',
      '24h',
    );
    const accessExpiresInSeconds = parseDurationToSeconds(accessExpiration);

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret', 'dev-secret'),
      expiresIn: accessExpiresInSeconds,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret', 'dev-secret'),
      expiresIn: 604800, // 7 days in seconds
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresInSeconds,
      tokenType: 'Bearer',
    };
  }

  async refreshToken(token: string): Promise<AuthTokensResponse> {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.secret', 'dev-secret'),
      });

      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, decoded.sub),
      });

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`Refresh token validation failed: ${message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<UserProfileResponse> {
    let user = await db.query.users.findFirst({
      where: eq(schema.users.google_id, profile.googleId),
    });

    if (!user && profile.email) {
      user = await db.query.users.findFirst({
        where: eq(schema.users.email, profile.email),
      });
    }

    if (!user) {
      const userId = uuidv4();
      const now = new Date().toISOString();

      await db.insert(schema.users).values({
        id: userId,
        email: profile.email,
        name: profile.name,
        google_id: profile.googleId,
        avatar_url: profile.avatarUrl ?? null,
        role: 'user',
        created_at: now,
        updated_at: now,
      });

      this.logger.log(`New Google user created: ${profile.email}`);

      user = await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
      });
    } else if (!user.google_id) {
      const now = new Date().toISOString();

      await db
        .update(schema.users)
        .set({
          google_id: profile.googleId,
          avatar_url: profile.avatarUrl ?? user.avatar_url,
          updated_at: now,
        })
        .where(eq(schema.users.id, user.id));

      user = await db.query.users.findFirst({
        where: eq(schema.users.id, user.id),
      });
    }

    return new UserProfileResponse({
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role,
      phone: user!.phone ?? undefined,
      npwp: user!.npwp ?? undefined,
      googleId: user!.google_id ?? undefined,
      avatarUrl: user!.avatar_url ?? undefined,
      locale: user!.locale,
      isActive: user!.is_active,
      createdAt: user!.created_at,
      updatedAt: user!.updated_at,
    });
  }

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return new UserProfileResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone ?? undefined,
      npwp: user.npwp ?? undefined,
      googleId: user.google_id ?? undefined,
      avatarUrl: user.avatar_url ?? undefined,
      locale: user.locale,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  }
}
