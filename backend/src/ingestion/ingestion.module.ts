import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { S3Service } from './s3.service';
import { LogParserService } from './log-parser.service';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import awsConfig from '../config/aws.config';

@Module({
  imports: [
    ConfigModule.forFeature(awsConfig),
    TypeOrmModule.forFeature([Conversation, Message]),
  ],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    S3Service,
    LogParserService,
  ],
  exports: [
    IngestionService,
    S3Service,
    LogParserService,
  ],
})
export class IngestionModule {} 