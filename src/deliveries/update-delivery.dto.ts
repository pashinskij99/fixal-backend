import { Transform, Type } from 'class-transformer';
import {
  IsIn,
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
  deliveryStatusValues,
  orderStatusValues,
  payerTypeValues,
  paymentStatusValues,
  paymentTypeValues,
} from './delivery.types';

export class UpdateDeliveryDto {
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsString()
  @IsIn(orderStatusValues)
  orderStatus?: string;

  @IsOptional()
  @IsString()
  @IsIn(paymentTypeValues)
  paymentType?: string;

  @IsOptional()
  @IsString()
  @IsIn(paymentStatusValues)
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(carrierValues)
  carrier?: string;

  @IsOptional()
  @IsString()
  @IsIn(deliveryMethodValues)
  deliveryMethod?: string;

  @IsOptional()
  @IsString()
  @IsIn(deliveryStatusValues)
  status?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  seatsCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  declaredValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  codAmount?: number | null;

  @IsOptional()
  @IsString()
  @IsIn(payerTypeValues)
  payerType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  shippingCost?: number | null;

  @IsOptional()
  @IsString()
  formattedAddress?: string;

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
