import { IsString, IsOptional } from 'class-validator';

export class GetDeliveriesFilterDto {
  @IsOptional()
  @IsString()
  DateTime?: string;

  @IsOptional()
  @IsString()
  DateTimeFrom?: string;

  @IsOptional()
  @IsString()
  DateTimeTo?: string;

  @IsOptional()
  @IsString()
  Page?: string;

  @IsOptional()
  @IsString()
  GetFullList?: string;

  @IsOptional()
  @IsString()
  RedeliveryMoney?: string;
}
