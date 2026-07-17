import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IntegrationsService } from './integrations.service';
import { GetDeliveriesFilterDto } from './dto/get-deliveries-filter.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('onboarding/integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('business/:businessId')
  async getIntegrationsByBusiness(@Param('businessId') businessId: number) {
    return this.integrationsService.findByBusiness(businessId);
  }

  @Get('nova-poshta/:businessId/deliveries')
  async getNovaPoshtaDeliveries(
    @Param('businessId') businessId: number,
    @Query() filter: GetDeliveriesFilterDto,
  ) {
    return this.integrationsService.getNovaPoshtaDeliveries(businessId, filter);
  }

  // Placeholder for connection endpoints
  @Post('nova-poshta')
  async connectNovaPoshta(
    @Body() body: { apiKey: string; businessId: number },
  ) {
    return this.integrationsService.connectNovaPoshta(
      body.businessId,
      body.apiKey,
    );
  }

  @Post('prro')
  async connectPRRO(
    @Request() req,
    @Body() body: { token: string; businessId: number },
  ) {
    return { message: 'PRRO connection endpoint' };
  }
}
