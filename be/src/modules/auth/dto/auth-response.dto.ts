import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponse {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Access token expiry in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'Token type', example: 'Bearer' })
  tokenType: string = 'Bearer';
}

export class UserProfileResponse {
  @ApiProperty({ description: 'User unique ID' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  name: string;

  @ApiProperty({ description: 'User role', example: 'user' })
  role: string;

  @ApiProperty({ required: false, description: 'Phone number' })
  phone?: string;

  @ApiProperty({ required: false, description: 'NPWP number' })
  npwp?: string;

  @ApiProperty({ required: false, description: 'Google ID if linked' })
  googleId?: string;

  @ApiProperty({ required: false, description: 'Avatar URL' })
  avatarUrl?: string;

  @ApiProperty({ description: 'User locale', example: 'id' })
  locale: string;

  @ApiProperty({ description: 'Whether the user is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;

  @Exclude()
  password?: string;

  constructor(partial: Partial<UserProfileResponse>) {
    Object.assign(this, partial);
  }
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token' })
  @Expose()
  refreshToken: string;
}
