import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConsultantsController } from './consultants.controller';
import { ConsultantsService } from './consultants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [PassportModule],
  controllers: [ConsultantsController],
  providers: [ConsultantsService, JwtAuthGuard, RolesGuard],
  exports: [ConsultantsService],
})
export class ConsultantsModule {}
