import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Invoice } from './invoice.entity';

@Entity('billing_profiles')
export class BillingProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.billingProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  planName: string;

  @Column()
  price: string;

  @Column()
  last4: string;

  @Column()
  expiry: string;

  @OneToMany(() => Invoice, (invoice) => invoice.billingProfile)
  invoices: Invoice[];
}
