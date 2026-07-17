import {
  IsString,
  IsEnum,
  IsOptional,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { TaxSystem } from '../tax-system.enum';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8,10}$/, { message: 'Tax ID must be 8 or 10 digits' })
  taxId: string;

  @IsString()
  @IsNotEmpty()
  legalAddress: string;

  @IsEnum(TaxSystem)
  taxSystem: TaxSystem;

  @IsString()
  @IsOptional()
  publicName?: string;
}
