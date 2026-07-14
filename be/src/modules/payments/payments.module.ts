import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  imports: [PassportModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, JwtAuthGuard],
  exports: [PaymentsService],
})
export class PaymentsModule {}
