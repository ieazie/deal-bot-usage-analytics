import { IsNumber, IsBoolean, IsArray, IsString, IsOptional } from 'class-validator';

export class BatchResultDto {
  @IsBoolean()
  success: boolean;

  @IsNumber()
  processedCount: number;

  @IsNumber()
  failedCount: number;

  @IsNumber()
  conversationsCreated: number;

  @IsNumber()
  messagesCreated: number;

  @IsArray()
  @IsString({ each: true })
  errors: string[];

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsNumber()
  processingTimeMs?: number;
}

export class FileProcessingResultDto {
  @IsString()
  fileName: string;

  @IsString()
  s3Key: string;

  @IsBoolean()
  success: boolean;

  @IsNumber()
  totalEntries: number;

  @IsNumber()
  processedEntries: number;

  @IsNumber()
  skippedEntries: number;

  @IsNumber()
  conversationsCreated: number;

  @IsNumber()
  messagesCreated: number;

  @IsArray()
  batches: BatchResultDto[];

  @IsArray()
  @IsString({ each: true })
  errors: string[];

  @IsNumber()
  processingTimeMs: number;
} 