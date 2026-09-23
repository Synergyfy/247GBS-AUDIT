import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BillingProfile } from './billing-profile.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  billingProfileId: string;

  @ManyToOne(() => BillingProfile, (profile) => profile.invoices)
  @JoinColumn({ name: 'billingProfileId' })
  billingProfile: BillingProfile;

  @Column()
  invoiceNumber: string;

  @Column()
  date: string;

  @Column()
  amount: string;

  @Column()
  status: string;
}
