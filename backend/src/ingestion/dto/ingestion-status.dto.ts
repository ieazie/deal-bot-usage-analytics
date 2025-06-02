import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsDateString } from 'class-validator';

export class IngestionStatusDto {
  @IsString()
  id: string;

  @IsString()
  status: 'pending' | 'running' | 'completed' | 'failed';

  @IsString()
  s3Key: string;

  @IsString()
  bucket: string;

  @IsNumber()
  totalEntries: number;

  @IsNumber()
  processedEntries: number;

  @IsNumber()
  conversationsCreated: number;

  @IsNumber()
  messagesCreated: number;

  @IsArray()
  errors: string[];

  @IsDateString()
  startedAt: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class IngestionProgressDto {
  @IsNumber()
  totalFiles: number;

  @IsNumber()
  processedFiles: number;

  @IsNumber()
  currentFileProgress: number;

  @IsString()
  currentFileName: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  estimatedTimeRemaining?: string;
} 