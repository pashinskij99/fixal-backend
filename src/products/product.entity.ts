import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Business } from '../business/business.entity';
import { Category } from '../category/category.entity'; // TODO: create if not existing

// ---------- Enums ----------

export enum ProductStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  ON_ORDER = 'on_order',
  ARCHIVED = 'archived',
}

export enum UnitOfMeasure {
  PCS = 'pcs',
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
  M = 'm',
  PACK = 'pack',
}

export enum Currency {
  UAH = 'UAH',
  USD = 'USD',
  EUR = 'EUR',
}

export enum PackageType {
  BOX = 'box',
  ENVELOPE = 'envelope',
  TUBE = 'tube',
  BAG = 'bag',
  PALLET = 'pallet',
}

export enum DeliveryService {
  NOVA_POSHTA = 'nova_poshta',
  UKRPOSHTA = 'ukrposhta',
  ROZETKA = 'rozetka',
  MEEST = 'meest',
  SAT = 'sat',
  DELIVERY_GROUP = 'delivery_group',
}

// ---------- JSONB shapes ----------

export type ProductParameterOption = {
  value: string;
  price?: number;
};

// Custom/dynamic fields — the flexible layer for anything not modeled
// as a first-class column (niche, business-specific attributes).
export type ProductDynamicParameter = {
  name: string;
  options: ProductParameterOption[];
};

export type ProductDimensions = {
  length: number; // cm
  width: number; // cm
  height: number; // cm
};

@Entity()
@Index(['business', 'sku'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  // ===================== BASIC INFO =====================

  @Column()
  name: string;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'varchar', nullable: true })
  barcode: string | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  category: Category | null;

  @Column({ type: 'varchar', nullable: true })
  brand: string | null;

  @Column({ type: 'varchar', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // ===================== PRICING =====================

  @Column('decimal', { precision: 10, scale: 2 })
  purchasePrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // retail price

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  salePrice: number | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  wholesalePrice: number | null;

  @Column({ type: 'enum', enum: Currency, default: Currency.UAH })
  currency: Currency;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  vatRate: number | null;

  // ===================== STOCK / UNITS =====================

  @Column({ type: 'enum', enum: UnitOfMeasure, default: UnitOfMeasure.PCS })
  unit: UnitOfMeasure;

  @Column('int', { default: 0 })
  stockQuantity: number;

  @Column('int', { nullable: true })
  minStockLevel: number | null;

  @Column({ type: 'varchar', nullable: true })
  warehouseLocation: string | null;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.IN_STOCK,
  })
  status: ProductStatus;

  // ===================== MEDIA =====================

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'jsonb', default: [] })
  gallery: string[];

  // ===================== DELIVERY =====================

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  weight: number | null; // kg

  @Column({ type: 'jsonb', nullable: true })
  dimensions: ProductDimensions | null;

  @Column({ type: 'enum', enum: PackageType, nullable: true })
  packageType: PackageType | null;

  @Column({ default: false })
  isFragile: boolean;

  @Column({ type: 'enum', enum: DeliveryService, array: true, default: [] })
  allowedDeliveryServices: DeliveryService[];

  // ===================== SEO / MARKETPLACE =====================

  @Column({ type: 'varchar', nullable: true })
  slug: string | null;

  @Column({ type: 'varchar', nullable: true })
  seoTitle: string | null;

  @Column({ type: 'varchar', nullable: true })
  seoDescription: string | null;

  @Column({ default: false })
  isPublished: boolean;

  // ===================== MISC =====================

  @Column({ type: 'int', nullable: true })
  warrantyMonths: number | null;

  @Column({ type: 'varchar', array: true, default: [] })
  tags: string[];

  @Column({ type: 'jsonb', default: [] })
  dynamicParameters: ProductDynamicParameter[];

  // ===================== RELATIONS =====================

  @ManyToOne(() => Business, (business) => business.products, {
    onDelete: 'CASCADE',
  })
  business: Business;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
