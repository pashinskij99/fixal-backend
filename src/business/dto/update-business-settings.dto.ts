import { IsIn, IsOptional, IsString } from 'class-validator';
import { carrierValues } from '../../deliveries/delivery.types';

export class UpdateBusinessSettingsDto {
  @IsOptional()
  @IsString()
  @IsIn(carrierValues)
  defaultCarrier?: string;
}