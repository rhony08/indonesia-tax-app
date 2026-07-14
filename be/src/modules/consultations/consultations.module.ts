import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [PassportModule],
  controllers: [ConsultationsController],
  providers: [ConsultationsService, JwtAuthGuard, RolesGuard],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
