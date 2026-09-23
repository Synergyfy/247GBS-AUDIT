import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notification_settings')
export class NotificationSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.notificationSettings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: true })
  isActive: boolean;
}
