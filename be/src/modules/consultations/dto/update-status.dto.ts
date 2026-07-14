import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({
    enum: ['pending', 'active', 'completed', 'cancelled'],
    description: 'Consultation status',
    example: 'active',
  })
  @IsString()
  @IsIn(['pending', 'active', 'completed', 'cancelled'])
  status: string;
}
