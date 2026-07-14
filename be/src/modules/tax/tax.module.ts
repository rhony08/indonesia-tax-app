import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [PassportModule],
  controllers: [TaxController],
  providers: [TaxService, JwtAuthGuard, RolesGuard],
  exports: [TaxService],
})
export class TaxModule {}
