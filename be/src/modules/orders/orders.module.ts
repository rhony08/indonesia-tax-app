import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  imports: [PassportModule],
  controllers: [OrdersController],
  providers: [OrdersService, JwtAuthGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
