import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('usage_metrics')
@Index(['date'])
@Index(['metric_type'])
@Index(['date', 'metric_type'], { unique: true })
export class UsageMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({
    type: 'enum',
    enum: ['daily_queries', 'weekly_queries', 'response_time', 'no_results'],
  })
  @Index()
  metric_type: 'daily_queries' | 'weekly_queries' | 'response_time' | 'no_results';

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
} 