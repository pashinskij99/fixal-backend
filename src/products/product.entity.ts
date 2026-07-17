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

export type ProductParameterOption = {
  value: string;
  price?: number;
};

export type ProductDynamicParameter = {
  name: string;
  options: ProductParameterOption[];
};

@Entity()
@Index(['business', 'sku'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  salePrice: number | null;

  @Column()
  sku: string;

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'jsonb', default: [] })
  dynamicParameters: ProductDynamicParameter[];

  @ManyToOne(() => Business, (business) => business.products, {
    onDelete: 'CASCADE',
  })
  business: Business;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
