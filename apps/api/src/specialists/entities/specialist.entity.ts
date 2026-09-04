import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('specialists')
export class Specialist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column({ type: 'float', default: 5.0 })
  rating: number;

  @Column({ default: 0 })
  reviews: number;

  @Column({ type: 'simple-array' })
  expertise: string[];

  @Column({ default: 'Available' })
  status: string;

  @Column()
  experience: string;

  @Column({ nullable: true })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
