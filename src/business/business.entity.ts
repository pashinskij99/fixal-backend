import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../user.entity';
import { TaxSystem } from './tax-system.enum';
import { Integration } from '../onboarding/integration.entity';
import { Product } from '../products/product.entity';
import { Order } from '../deliveries/order.entity';
import { Carrier } from '../deliveries/carrier.enum';

@Entity()
export class Business {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  legalName: string;

  @Column()
  taxId: string; // ІПН or ЄДРПОУ

  @Column()
  legalAddress: string;

  @Column({
    type: 'enum',
    enum: TaxSystem,
  })
  taxSystem: TaxSystem;

  @Column({ nullable: true })
  publicName: string;

  @Column({ type: 'enum', enum: Carrier, nullable: true })
  defaultCarrier: Carrier | null;

  @ManyToOne(() => User, (user) => user.businesses)
  owner: User;

  @OneToMany(() => Integration, (integration) => integration.business)
  integrations: Integration[];

  @OneToMany(() => Product, (product) => product.business)
  products: Product[];

  @OneToMany(() => Order, (order) => order.business)
  orders: Order[];
}
