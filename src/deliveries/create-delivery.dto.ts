import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import {
  carrierValues,
  deliveryMethodValues,
  orderStatusValues,
  payerTypeValues,
  paymentStatusValues,
  paymentTypeValues,
} from './delivery.types';

export class CreateDeliveryDto {
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsString()
  @IsIn(orderStatusValues)
  orderStatus?: string;

  @IsString()
  @IsIn(paymentTypeValues)
  paymentType!: string;

  @IsOptional()
  @IsString()
  @IsIn(paymentStatusValues)
  paymentStatus?: string;

  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @IsString()
  @IsNotEmpty()
  recipientPhone!: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsString()
  @IsIn(carrierValues)
  carrier!: string;

  @IsString()
  @IsIn(deliveryMethodValues)
  deliveryMethod!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  seatsCount?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  declaredValue!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  codAmount?: number;

  @IsString()
  @IsIn(payerTypeValues)
  payerType!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @IsString()
  @IsNotEmpty()
  formattedAddress!: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as Record<string, unknown>;
      } catch {
        return value;
      }
    }

    return value;
  })
  @IsOptional()
  @IsObject()
  carrierMetadata?: Record<string, unknown>;
}
