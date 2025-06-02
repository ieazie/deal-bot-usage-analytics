import { DataSource } from 'typeorm';
import { Conversation, Message, UsageMetric } from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://analytics_user:analytics_pass@localhost:5432/dealbot_analytics',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'analytics_user',
  password: process.env.DB_PASSWORD || 'analytics_pass',
  database: process.env.DB_NAME || 'dealbot_analytics',
  synchronize: false, // Always use migrations in production
  logging: process.env.NODE_ENV === 'development',
  entities: [Conversation, Message, UsageMetric],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}); 