import { Controller, Post, Get, Query, Body, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { IngestionResult } from './interfaces/log-entry.interface';
import { FileProcessingResultDto } from './dto/batch-result.dto';

@ApiTags('ingestion')
@Controller('ingestion')
export class IngestionController {
  private readonly logger = new Logger(IngestionController.name);

  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * Trigger full ingestion process for all S3 objects
   */
  @Post('start')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Start data ingestion',
    description: 'Triggers the full ingestion process for all S3 objects with optional prefix filtering'
  })
  @ApiQuery({ name: 'prefix', required: false, description: 'S3 object prefix filter' })
  async startIngestion(
    @Query('prefix') prefix?: string,
  ): Promise<{ message: string; started: boolean }> {
    this.logger.log(`Starting ingestion process with prefix: ${prefix || 'none'}`);
    
    try {
      // Start ingestion in the background (in a real application, this would be queued)
      setImmediate(async () => {
        try {
          const result = await this.ingestionService.ingestAllLogs(prefix);
          this.logger.log(`Ingestion completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
          this.logger.log(`Processed: ${result.processedEntries} entries, Errors: ${result.errors.length}`);
        } catch (error) {
          this.logger.error(`Ingestion failed: ${error.message}`, error.stack);
        }
      });

      return {
        message: 'Ingestion process started',
        started: true,
      };
    } catch (error) {
      this.logger.error(`Failed to start ingestion: ${error.message}`, error.stack);
      return {
        message: `Failed to start ingestion: ${error.message}`,
        started: false,
      };
    }
  }

  /**
   * Trigger ingestion for a specific S3 object
   */
  @Post('process-file')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process specific file',
    description: 'Triggers ingestion for a specific S3 object by key'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        s3Key: {
          type: 'string',
          description: 'S3 object key to process'
        }
      },
      required: ['s3Key']
    }
  })
  async processFile(
    @Body('s3Key') s3Key: string,
  ): Promise<FileProcessingResultDto> {
    this.logger.log(`Processing specific file: ${s3Key}`);
    
    if (!s3Key) {
      throw new Error('s3Key is required');
    }

    try {
      const result = await this.ingestionService.processS3Object(s3Key);
      this.logger.log(`File processing completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      return result;
    } catch (error) {
      this.logger.error(`File processing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Run synchronous ingestion (for testing or small datasets)
   */
  @Post('run-sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run synchronous ingestion',
    description: 'Runs synchronous ingestion process for testing or small datasets'
  })
  @ApiQuery({ name: 'prefix', required: false, description: 'S3 object prefix filter' })
  async runSyncIngestion(
    @Query('prefix') prefix?: string,
  ): Promise<IngestionResult> {
    this.logger.log(`Running synchronous ingestion with prefix: ${prefix || 'none'}`);
    
    try {
      const result = await this.ingestionService.ingestAllLogs(prefix);
      this.logger.log(`Synchronous ingestion completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      return result;
    } catch (error) {
      this.logger.error(`Synchronous ingestion failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get ingestion statistics
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get ingestion statistics',
    description: 'Returns statistics about the ingestion process'
  })
  async getIngestionStats(): Promise<any> {
    this.logger.log('Fetching ingestion statistics');
    
    try {
      const stats = await this.ingestionService.getIngestionStats();
      return {
        status: 'success',
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Failed to get ingestion stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Health check endpoint for ingestion service
   */
  @Get('health')
  @ApiOperation({
    summary: 'Ingestion health check',
    description: 'Health check endpoint for the ingestion service'
  })
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
} 