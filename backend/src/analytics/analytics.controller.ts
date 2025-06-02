import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@UsePipes(new ValidationPipe({ transform: true }))
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Get overall analytics metrics dashboard data
   * Includes summary, time series, and common topics
   */
  @Get('overview')
  @ApiOperation({ 
    summary: 'Get analytics overview',
    description: 'Returns comprehensive analytics dashboard data including summary metrics, time series, and common topics'
  })
  async getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getOverview({ startDate, endDate });
  }

  /**
   * Get query counts per day/week/month
   * Time series data for query volume
   */
  @Get('query-counts')
  @ApiOperation({
    summary: 'Get query count time series',
    description: 'Returns time series data showing query volume over time with configurable granularity'
  })
  async getQueryCounts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('granularity') granularity?: string,
  ) {
    return this.analyticsService.getQueryCounts({ startDate, endDate, granularity });
  }

  /**
   * Get average response times over time
   * Time series data for performance analysis
   */
  @Get('response-times')
  @ApiOperation({
    summary: 'Get response time metrics',
    description: 'Returns time series data for response time performance analysis'
  })
  async getResponseTimes(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getResponseTimes({ startDate, endDate });
  }

  /**
   * Get most common questions/topics
   * Topic analysis with examples
   */
  @Get('common-topics')
  @ApiOperation({
    summary: 'Get common topics analysis',
    description: 'Returns analysis of most frequently discussed topics with examples'
  })
  async getCommonTopics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getCommonTopics({ startDate, endDate });
  }

  /**
   * Get queries that returned no results
   * Error analysis for improvement
   */
  @Get('no-results')
  @ApiOperation({
    summary: 'Get queries with no results',
    description: 'Returns queries that did not return useful results for analysis and improvement'
  })
  async getNoResultsQueries(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getNoResultsQueries({ startDate, endDate });
  }

  /**
   * Get conversations with low satisfaction scores
   * Quality analysis
   */
  @Get('low-satisfaction')
  @ApiOperation({
    summary: 'Get low satisfaction conversations',
    description: 'Returns conversations with poor satisfaction scores for quality analysis'
  })
  async getLowSatisfactionQueries(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getLowSatisfactionQueries({ startDate, endDate });
  }

  /**
   * Get detailed performance metrics
   * Including percentiles and slowest queries
   */
  @Get('performance')
  @ApiOperation({
    summary: 'Get detailed performance metrics',
    description: 'Returns comprehensive performance metrics including percentiles and slowest queries'
  })
  async getPerformanceMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getPerformanceMetrics({ startDate, endDate });
  }
} 