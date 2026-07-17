import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Business } from './business/business.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  password: string;

  @OneToMany(() => Business, (business) => business.owner)
  businesses: Business[];
}
