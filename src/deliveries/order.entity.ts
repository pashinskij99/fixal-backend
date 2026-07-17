import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Business } from '../business/business.entity';
import { Delivery } from './delivery.entity';
import { OrderStatus } from './order-status.enum';
import { PaymentType } from './payment-type.enum';
import { PaymentStatus } from './payment-status.enum';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  business: Business;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ length: 3, default: 'UAH' })
  currency: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentType })
  paymentType: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column()
  recipientName: string;

  @Column()
  recipientPhone: string;

  @Column({ type: 'varchar', nullable: true })
  recipientEmail: string | null;

  @OneToMany(() => Delivery, (delivery) => delivery.order)
  deliveries: Delivery[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
