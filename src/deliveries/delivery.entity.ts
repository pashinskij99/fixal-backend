import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Carrier } from './carrier.enum';
import { DeliveryMethod } from './delivery-method.enum';
import { DeliveryStatus } from './delivery-status.enum';
import { PayerType } from './payer-type.enum';

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.deliveries, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @Column({ type: 'enum', enum: Carrier })
  carrier: Carrier;

  @Column({ type: 'enum', enum: DeliveryMethod })
  deliveryMethod: DeliveryMethod;

  @Column({ type: 'varchar', nullable: true })
  trackingNumber: string | null;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.DRAFT,
  })
  status: DeliveryStatus;

  @Column('decimal', { precision: 6, scale: 2 })
  weight: number;

  @Column('decimal', { precision: 6, scale: 4, nullable: true })
  volume: number | null;

  @Column({ default: 1 })
  seatsCount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  declaredValue: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  codAmount: number | null;

  @Column({ type: 'enum', enum: PayerType })
  payerType: PayerType;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  shippingCost: number | null;

  @Column()
  formattedAddress: string;

  @Column({ type: 'jsonb', default: {} })
  carrierMetadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
