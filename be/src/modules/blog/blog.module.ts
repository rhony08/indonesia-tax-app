import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [PassportModule],
  controllers: [BlogController],
  providers: [BlogService, JwtAuthGuard, RolesGuard],
  exports: [BlogService],
})
export class BlogModule {}
