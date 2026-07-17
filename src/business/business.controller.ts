import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('onboarding/setup-business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  async create(@Request() req, @Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(req.user.userId, createBusinessDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.businessService.findAllByUser(req.user.userId);
  }

  @Patch(':businessId/settings')
  async updateSettings(
    @Request() req,
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() dto: UpdateBusinessSettingsDto,
  ) {
    return this.businessService.updateSettings(req.user.userId, businessId, dto);
  }
}
