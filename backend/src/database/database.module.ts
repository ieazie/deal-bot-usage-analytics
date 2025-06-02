import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Conversation, Message, UsageMetric } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'analytics_user'),
        password: configService.get<string>('DB_PASSWORD', 'analytics_pass'),
        database: configService.get<string>('DB_NAME', 'dealbot_analytics'),
        entities: [Conversation, Message, UsageMetric],
        synchronize: false, // Always use migrations
        logging: configService.get<string>('NODE_ENV') === 'development',
        autoLoadEntities: true,
        ssl: configService.get<string>('NODE_ENV') === 'production' 
          ? { rejectUnauthorized: false } 
          : false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Conversation, Message, UsageMetric]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {} 