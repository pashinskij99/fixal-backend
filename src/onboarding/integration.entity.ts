import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Business } from '../business/business.entity';

@Entity()
export class Integration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // 'nova-poshta' | 'prro'

  @Column()
  apiKey: string;

  @ManyToOne(() => Business, (business) => business.integrations)
  business: Business;
}
