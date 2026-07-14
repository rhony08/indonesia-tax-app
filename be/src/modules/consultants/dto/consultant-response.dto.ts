import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConsultantResponseDto {
  @ApiProperty({ description: 'Consultant ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Consultant name (from user)' })
  name: string;

  @ApiPropertyOptional({ description: 'User email' })
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatar_url?: string;

  @ApiProperty({ description: 'Certification level', enum: ['A', 'B', 'C'] })
  cert_level: string;

  @ApiProperty({ description: 'Certification number' })
  cert_number: string;

  @ApiPropertyOptional({ description: 'Practice license number' })
  izin_praktik?: string;

  @ApiProperty({ description: 'List of specializations' })
  specializations: string[];

  @ApiPropertyOptional({ description: 'Biography' })
  bio?: string;

  @ApiProperty({ description: 'Price per session in IDR' })
  price_per_session: number;

  @ApiProperty({ description: 'Average rating (0-5)' })
  rating: number;

  @ApiProperty({ description: 'Total number of reviews' })
  total_reviews: number;

  @ApiProperty({ description: 'Total completed sessions' })
  total_sessions: number;

  @ApiProperty({ description: 'Verification status' })
  is_verified: boolean;

  @ApiProperty({ description: 'Online status' })
  is_online: boolean;

  @ApiProperty({ description: 'Account creation date' })
  created_at: string;
}

export class ConsultantListItemDto {
  @ApiProperty({ description: 'Consultant ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Consultant name' })
  name: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatar_url?: string;

  @ApiProperty({ description: 'Certification level' })
  cert_level: string;

  @ApiProperty({ description: 'List of specializations' })
  specializations: string[];

  @ApiProperty({ description: 'Price per session in IDR' })
  price_per_session: number;

  @ApiProperty({ description: 'Average rating (0-5)' })
  rating: number;

  @ApiProperty({ description: 'Total reviews' })
  total_reviews: number;

  @ApiProperty({ description: 'Total sessions' })
  total_sessions: number;

  @ApiProperty({ description: 'Online status' })
  is_online: boolean;

  @ApiProperty({ description: 'Verification status' })
  is_verified: boolean;

  @ApiProperty({ description: 'Account creation date' })
  created_at: string;
}

export class ConsultantAvailabilityDto {
  @ApiProperty({ description: 'Schedule entry ID' })
  id: string;

  @ApiProperty({ description: 'Day of week (0-6)' })
  day_of_week: number;

  @ApiProperty({ description: 'Start time (HH:mm)' })
  start_time: string;

  @ApiProperty({ description: 'End time (HH:mm)' })
  end_time: string;

  @ApiProperty({ description: 'Whether the slot is active' })
  is_active: boolean;
}

export class ConsultantReviewDto {
  @ApiProperty({ description: 'Review ID' })
  id: string;

  @ApiProperty({ description: 'Rating (1-5)' })
  rating: number;

  @ApiPropertyOptional({ description: 'Review comment' })
  comment?: string;

  @ApiProperty({ description: 'Reviewer name' })
  user_name: string;

  @ApiPropertyOptional({ description: 'Reviewer avatar' })
  user_avatar?: string;

  @ApiProperty({ description: 'Review creation date' })
  created_at: string;
}

export class BookSessionResponseDto {
  @ApiProperty({ description: 'Consultation ID' })
  id: string;

  @ApiProperty({ description: 'Consultation status' })
  status: string;

  @ApiProperty({ description: 'Consultation type' })
  type: string;

  @ApiProperty({ description: 'Order ID (if applicable)' })
  order_id?: string;

  @ApiProperty({ description: 'Amount in IDR' })
  amount?: number;

  @ApiProperty({ description: 'Creation date' })
  created_at: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'List of items' })
  data: T[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
