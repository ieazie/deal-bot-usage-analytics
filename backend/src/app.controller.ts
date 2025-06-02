import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  /**
   * Health check endpoint
   */
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the application'
  })
  getHealth(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * API status and information
   */
  @Get('status')
  @ApiOperation({
    summary: 'API status',
    description: 'Returns API status and basic information'
  })
  getStatus(): { 
    name: string; 
    version: string; 
    status: string; 
    timestamp: string;
    environment: string;
  } {
    return {
      name: 'Deal Bot Analytics API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * API documentation redirect
   */
  @Get()
  @ApiOperation({
    summary: 'API root',
    description: 'Root endpoint with basic API information'
  })
  getRoot(): { 
    message: string; 
    docs: string; 
    version: string;
    endpoints: string[];
  } {
    return {
      message: 'Deal Bot Analytics API',
      docs: '/api/docs',
      version: '1.0.0',
      endpoints: [
        '/health',
        '/status',
        '/analytics/*',
        '/conversations/*',
        '/ingestion/*'
      ],
    };
  }
} 