import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './create-delivery.dto';
import { UpdateDeliveryDto } from './update-delivery.dto';
import { FindDeliveriesQueryDto } from './find-deliveries-query.dto';

type AuthenticatedRequest = ExpressRequest & {
  user: { userId: number; email: string };
};

@UseGuards(AuthGuard('jwt'))
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post('business/:businessId')
  async create(
    @Request() req: AuthenticatedRequest,
    @Param('businessId') businessId: number,
    @Body() dto: CreateDeliveryDto,
  ) {
    return this.deliveriesService.createForBusiness(
      req.user.userId,
      businessId,
      dto,
    );
  }

  @Get('business/:businessId')
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Param('businessId') businessId: number,
    @Query() query: FindDeliveriesQueryDto,
  ) {
    return this.deliveriesService.findByBusiness(
      req.user.userId,
      businessId,
      query,
    );
  }

  @Get('business/:businessId/:deliveryId')
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('businessId') businessId: number,
    @Param('deliveryId') deliveryId: string,
  ) {
    return this.deliveriesService.findOne(
      req.user.userId,
      businessId,
      deliveryId,
    );
  }

  @Patch('business/:businessId/:deliveryId')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('businessId') businessId: number,
    @Param('deliveryId') deliveryId: string,
    @Body() dto: UpdateDeliveryDto,
  ) {
    return this.deliveriesService.update(
      req.user.userId,
      businessId,
      deliveryId,
      dto,
    );
  }
}
