import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello, I have a question about my tax return.',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    enum: ['text', 'file'],
    description: 'Message type',
    default: 'text',
  })
  @IsOptional()
  @IsString()
  @IsIn(['text', 'file'])
  type?: string = 'text';

  @ApiPropertyOptional({
    description: 'URL of the attached file',
  })
  @IsOptional()
  @IsString()
  file_url?: string;

  @ApiPropertyOptional({
    description: 'Original name of the attached file',
  })
  @IsOptional()
  @IsString()
  file_name?: string;
}
