import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('conversations')
@Index(['user_id'])
@Index(['started_at'])
@Index(['satisfaction_score'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  user_id: string;

  @Column({ type: 'timestamp' })
  @Index()
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ended_at?: Date;

  @Column({ type: 'integer', default: 0 })
  total_messages: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  satisfaction_score?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
} 