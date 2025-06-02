import { IsOptional, IsString, IsDateString, IsInt, IsDecimal, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchConversationsDto {
  @ApiProperty({
    description: 'Search term for full-text search across conversation messages',
    example: 'investment deal',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter conversations by specific user ID',
    example: 'user123',
    required: false
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Start date filter (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date filter (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Minimum number of messages in conversation',
    example: 1,
    minimum: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minMessages?: number;

  @ApiProperty({
    description: 'Maximum number of messages in conversation',
    example: 50,
    minimum: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxMessages?: number;

  @ApiProperty({
    description: 'Minimum satisfaction score (0-5)',
    example: 3.0,
    minimum: 0,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsDecimal()
  @Min(0)
  @Max(5)
  minSatisfaction?: number;

  @ApiProperty({
    description: 'Maximum satisfaction score (0-5)',
    example: 5.0,
    minimum: 0,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsDecimal()
  @Min(0)
  @Max(5)
  maxSatisfaction?: number;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'started_at',
    default: 'started_at',
    required: false
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'started_at';

  @ApiProperty({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
} 