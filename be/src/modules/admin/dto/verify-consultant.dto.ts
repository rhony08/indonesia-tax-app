import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyConsultantDto {
  @ApiProperty({
    description: 'Whether to verify (true) or unverify (false) the consultant',
    example: true,
  })
  @IsBoolean()
  is_verified: boolean;
}
