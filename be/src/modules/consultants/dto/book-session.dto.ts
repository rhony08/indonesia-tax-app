import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookSessionDto {
  @ApiProperty({ enum: ['chat', 'task'], description: 'Consultation type' })
  @IsString()
  @IsIn(['chat', 'task'])
  type: string;

  @ApiPropertyOptional({ description: 'Optional message to the consultant' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Service type for billing purposes' })
  @IsOptional()
  @IsString()
  service_type?: string;
}
