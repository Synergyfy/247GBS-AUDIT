import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BillingProfile } from '../../protocols/entities/billing-profile.entity';
import { NotificationSetting } from '../../protocols/entities/notification-setting.entity';

@Entity('audit_users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  website: string;

  @Column({ default: 'User' })
  role: string;

  @Column({ default: 'Active' })
  status: string;

  @Column({ default: 10 })
  tokens: number;

  @OneToOne(() => BillingProfile, (profile) => profile.user)
  billingProfile: BillingProfile;

  @OneToMany(() => NotificationSetting, (setting) => setting.user)
  notificationSettings: NotificationSetting[];

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  currentHashedRefreshToken: string | null;

  @Column({ nullable: true })
  @Exclude()
  mfaSecret: string;

  @Column({ default: false })
  isMfaEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
