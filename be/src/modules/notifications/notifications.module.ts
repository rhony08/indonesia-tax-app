import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [PassportModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, JwtAuthGuard, RolesGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
