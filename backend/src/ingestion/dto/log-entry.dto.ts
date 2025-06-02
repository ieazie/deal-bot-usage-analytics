import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';

export class LogEntryDto {
  @IsString()
  timestamp: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  requestId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 