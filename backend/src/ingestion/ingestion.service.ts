import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { S3Service } from './s3.service';
import { LogParserService } from './log-parser.service';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { ParsedLogEntry, IngestionResult } from './interfaces/log-entry.interface';
import { BatchResultDto, FileProcessingResultDto } from './dto/batch-result.dto';
import { v5 as uuidv5 } from 'uuid';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly BATCH_SIZE = 1000; // Process logs in batches of 1000
  private readonly UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Standard namespace UUID

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private dataSource: DataSource,
    private s3Service: S3Service,
    private logParserService: LogParserService,
  ) {}

  /**
   * Main ingestion method - processes all objects from S3
   */
  async ingestAllLogs(prefix?: string): Promise<IngestionResult> {
    this.logger.log('Starting full log ingestion process');
    
    const startTime = Date.now();
    let totalProcessedEntries = 0;
    let totalConversationsCreated = 0;
    let totalMessagesCreated = 0;
    const allErrors: string[] = [];

    try {
      // List all objects in S3
      const s3Result = await this.s3Service.listObjects(prefix);
      this.logger.log(`Found ${s3Result.objects.length} objects to process`);

      // Process each object
      for (const s3Object of s3Result.objects) {
        try {
          this.logger.log(`Processing file: ${s3Object.key}`);
          
          const result = await this.processS3Object(s3Object.key);
          
          totalProcessedEntries += result.processedEntries;
          totalConversationsCreated += result.conversationsCreated;
          totalMessagesCreated += result.messagesCreated;
          allErrors.push(...result.errors);

          this.logger.log(`Completed processing ${s3Object.key}: ${result.processedEntries} entries`);
        } catch (error) {
          const errorMsg = `Failed to process ${s3Object.key}: ${error.message}`;
          this.logger.error(errorMsg, error.stack);
          allErrors.push(errorMsg);
        }
      }

      const processingTimeMs = Date.now() - startTime;
      this.logger.log(`Ingestion completed in ${processingTimeMs}ms`);
      this.logger.log(`Total processed: ${totalProcessedEntries} entries, ${totalConversationsCreated} conversations, ${totalMessagesCreated} messages`);

      return {
        success: allErrors.length === 0,
        processedEntries: totalProcessedEntries,
        errors: allErrors,
        conversationsCreated: totalConversationsCreated,
        messagesCreated: totalMessagesCreated,
      };
    } catch (error) {
      this.logger.error(`Ingestion process failed: ${error.message}`, error.stack);
      return {
        success: false,
        processedEntries: totalProcessedEntries,
        errors: [...allErrors, error.message],
        conversationsCreated: totalConversationsCreated,
        messagesCreated: totalMessagesCreated,
      };
    }
  }

  /**
   * Process a single S3 object
   */
  async processS3Object(s3Key: string): Promise<FileProcessingResultDto> {
    const startTime = Date.now();
    this.logger.log(`Starting to process S3 object: ${s3Key}`);

    try {
      // Download the object content
      const content = await this.s3Service.downloadObject(s3Key);
      
      // Parse the log content
      const cloudWatchEntries = this.logParserService.parseLogContent(content);
      this.logger.log(`Parsed ${cloudWatchEntries.length} CloudWatch entries from ${s3Key}`);

      // Transform into structured conversation data
      const parsedEntries = this.logParserService.parseLogEntries(cloudWatchEntries);
      this.logger.log(`Extracted ${parsedEntries.length} structured entries from ${s3Key}`);

      // Process in batches
      const batches = this.chunkArray(parsedEntries, this.BATCH_SIZE);
      const batchResults: BatchResultDto[] = [];
      let totalProcessed = 0;
      let totalConversationsCreated = 0;
      let totalMessagesCreated = 0;
      const errors: string[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        this.logger.log(`Processing batch ${i + 1}/${batches.length} with ${batch.length} entries`);

        try {
          const batchResult = await this.processBatch(batch, `${s3Key}_batch_${i + 1}`);
          batchResults.push(batchResult);
          
          totalProcessed += batchResult.processedCount;
          totalConversationsCreated += batchResult.conversationsCreated;
          totalMessagesCreated += batchResult.messagesCreated;
          errors.push(...batchResult.errors);

          this.logger.log(`Batch ${i + 1} completed: ${batchResult.processedCount} processed`);
        } catch (error) {
          const errorMsg = `Batch ${i + 1} failed: ${error.message}`;
          this.logger.error(errorMsg, error.stack);
          errors.push(errorMsg);
        }
      }

      const processingTimeMs = Date.now() - startTime;

      return {
        fileName: s3Key.split('/').pop() || s3Key,
        s3Key,
        success: errors.length === 0,
        totalEntries: parsedEntries.length,
        processedEntries: totalProcessed,
        skippedEntries: parsedEntries.length - totalProcessed,
        conversationsCreated: totalConversationsCreated,
        messagesCreated: totalMessagesCreated,
        batches: batchResults,
        errors,
        processingTimeMs,
      };
    } catch (error) {
      this.logger.error(`Failed to process S3 object ${s3Key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process a batch of parsed log entries with database transaction
   */
  async processBatch(entries: ParsedLogEntry[], batchId: string): Promise<BatchResultDto> {
    const startTime = Date.now();
    const errors: string[] = [];
    let processedCount = 0;
    let conversationsCreated = 0;
    let messagesCreated = 0;

    // Use database transaction for consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Group entries by conversation
      const conversationGroups = this.groupByConversation(entries);
      
      for (const [conversationId, conversationEntries] of conversationGroups) {
        try {
          // Create or update conversation
          const conversation = await this.createOrUpdateConversation(
            conversationId,
            conversationEntries,
            queryRunner.manager,
          );

          if (conversation) {
            conversationsCreated++;
          }

          // Create messages for this conversation
          for (const entry of conversationEntries) {
            try {
              await this.createMessage(entry, queryRunner.manager);
              messagesCreated++;
              processedCount++;
            } catch (error) {
              const errorMsg = `Failed to create message for conversation ${conversationId}: ${error.message}`;
              this.logger.warn(errorMsg);
              errors.push(errorMsg);
            }
          }
        } catch (error) {
          const errorMsg = `Failed to process conversation ${conversationId}: ${error.message}`;
          this.logger.warn(errorMsg);
          errors.push(errorMsg);
        }
      }

      // Commit transaction if successful
      await queryRunner.commitTransaction();
      
      const processingTimeMs = Date.now() - startTime;
      this.logger.log(`Batch ${batchId} completed successfully: ${processedCount}/${entries.length} processed`);

      return {
        success: errors.length === 0,
        processedCount,
        failedCount: entries.length - processedCount,
        conversationsCreated,
        messagesCreated,
        errors,
        batchId,
        processingTimeMs,
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Batch ${batchId} failed, transaction rolled back: ${error.message}`, error.stack);
      
      errors.push(error.message);
      
      return {
        success: false,
        processedCount: 0,
        failedCount: entries.length,
        conversationsCreated: 0,
        messagesCreated: 0,
        errors,
        batchId,
        processingTimeMs: Date.now() - startTime,
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Generate a deterministic UUID based on conversation identifier
   */
  private generateConversationUuid(conversationId: string): string {
    // Create a deterministic UUID using the conversation ID as seed
    return uuidv5(conversationId, this.UUID_NAMESPACE);
  }

  /**
   * Create or update a conversation record
   */
  private async createOrUpdateConversation(
    conversationId: string,
    entries: ParsedLogEntry[],
    manager: any,
  ): Promise<Conversation | null> {
    try {
      // Generate a proper UUID for the conversation
      const conversationUuid = this.generateConversationUuid(conversationId);
      
      // Check if conversation already exists
      let conversation = await manager.findOne(Conversation, {
        where: { id: conversationUuid },
      });

      if (!conversation) {
        // Create new conversation
        const firstEntry = entries[0];
        const lastEntry = entries[entries.length - 1];
        
        conversation = manager.create(Conversation, {
          id: conversationUuid,
          user_id: firstEntry.userId,
          started_at: firstEntry.message.timestamp,
          ended_at: lastEntry.message.timestamp,
          total_messages: entries.length,
          satisfaction_score: firstEntry.satisfactionScore,
        });

        await manager.save(Conversation, conversation);
        return conversation;
      } else {
        // Update existing conversation
        const messageCount = await manager.count(Message, {
          where: { conversation_id: conversationUuid },
        });

        conversation.total_messages = messageCount + entries.length;
        
        // Update satisfaction score if provided
        const latestScore = entries.find(e => e.satisfactionScore !== undefined)?.satisfactionScore;
        if (latestScore !== undefined) {
          conversation.satisfaction_score = latestScore;
        }

        await manager.save(Conversation, conversation);
        return null; // Return null to indicate no new conversation was created
      }
    } catch (error) {
      this.logger.error(`Failed to create/update conversation ${conversationId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a message record
   */
  private async createMessage(entry: ParsedLogEntry, manager: any): Promise<Message> {
    try {
      // Generate UUID for the conversation
      const conversationUuid = this.generateConversationUuid(entry.conversationId);
      
      // Check for duplicate messages (idempotency)
      const existingMessage = await manager.findOne(Message, {
        where: {
          conversation_id: conversationUuid,
          content: entry.message.content,
          timestamp: entry.message.timestamp,
          role: entry.message.role,
        },
      });

      if (existingMessage) {
        return existingMessage;
      }

      const message = manager.create(Message, {
        conversation_id: conversationUuid,
        role: entry.message.role,
        content: entry.message.content,
        timestamp: entry.message.timestamp,
        response_time_ms: entry.message.responseTimeMs,
        has_results: entry.message.hasResults,
        metadata: entry.message.metadata,
      });

      await manager.save(Message, message);
      return message;
    } catch (error) {
      this.logger.error(`Failed to create message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Group entries by conversation ID
   */
  private groupByConversation(entries: ParsedLogEntry[]): Map<string, ParsedLogEntry[]> {
    const groups = new Map<string, ParsedLogEntry[]>();

    for (const entry of entries) {
      const existing = groups.get(entry.conversationId) || [];
      existing.push(entry);
      groups.set(entry.conversationId, existing);
    }

    return groups;
  }

  /**
   * Split array into chunks of specified size
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get ingestion statistics
   */
  async getIngestionStats(): Promise<any> {
    try {
      const conversationCount = await this.conversationRepository.count();
      const messageCount = await this.messageRepository.count();
      
      // Use find with take: 1 instead of findOne to avoid selection condition requirement
      const latestMessages = await this.messageRepository.find({
        order: { created_at: 'DESC' },
        take: 1,
      });

      const oldestMessages = await this.messageRepository.find({
        order: { created_at: 'ASC' },
        take: 1,
      });

      const latestMessage = latestMessages.length > 0 ? latestMessages[0] : null;
      const oldestMessage = oldestMessages.length > 0 ? oldestMessages[0] : null;

      return {
        totalConversations: conversationCount,
        totalMessages: messageCount,
        latestIngestion: latestMessage?.created_at,
        oldestData: oldestMessage?.created_at,
      };
    } catch (error) {
      this.logger.error(`Failed to get ingestion stats: ${error.message}`, error.stack);
      throw error;
    }
  }
} 