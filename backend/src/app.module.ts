import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ConversationsModule } from './conversations/conversations.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AnalyticsModule,
    ConversationsModule,
    IngestionModule,
  ],
  controllers: [AppController],
})
export class AppModule {} 