export class CommonTopicDto {
  topic: string;
  count: number;
  percentage: number;
  examples: string[];
}

export class CommonTopicsResponseDto {
  topics: CommonTopicDto[];
  totalQueries: number;
  analysisDate: string;
} 