import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Exclude()
export class UserResponseDto {
  @ApiProperty({ description: 'User unique ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'User email address' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'User display name' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @Expose()
  phone?: string | null;

  @ApiPropertyOptional({ description: 'NPWP tax ID' })
  @Expose()
  npwp?: string | null;

  @ApiPropertyOptional({ description: 'Google OAuth ID' })
  @Expose()
  google_id?: string | null;

  @ApiPropertyOptional({ description: 'Avatar image URL' })
  @Expose()
  avatar_url?: string | null;

  @ApiProperty({
    description: 'User role',
    enum: ['user', 'consultant', 'admin'],
  })
  @Expose()
  role: string;

  @ApiProperty({ description: 'User locale preference' })
  @Expose()
  locale: string;

  @ApiProperty({ description: 'Whether the user account is active' })
  @Expose()
  is_active: boolean;

  @ApiProperty({ description: 'Account creation timestamp' })
  @Expose()
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updated_at: string;
}
