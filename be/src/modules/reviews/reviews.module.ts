import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [PassportModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, JwtAuthGuard, RolesGuard],
  exports: [ReviewsService],
})
export class ReviewsModule {}
