import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { Business } from './business.entity';
import { User } from '../user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business, User])],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
