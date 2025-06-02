#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { IngestionService } from '../ingestion/ingestion.service';

const logger = new Logger('IngestionCLI');

async function main() {
  logger.log('Starting Deal Bot Analytics Ingestion CLI');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const prefix = args.find(arg => arg.startsWith('--prefix='))?.split('=')[1];
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    printUsage();
    process.exit(0);
  }

  try {
    logger.log('Initializing NestJS application...');
    
    // Create NestJS application
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });

    // Get the ingestion service
    const ingestionService = app.get(IngestionService);

    logger.log(`Starting ingestion process${prefix ? ` with prefix: ${prefix}` : ''}`);
    
    const startTime = Date.now();
    
    // Run the ingestion
    const result = await ingestionService.ingestAllLogs(prefix);
    
    const duration = Date.now() - startTime;
    
    // Print results
    logger.log('='.repeat(50));
    logger.log('INGESTION COMPLETED');
    logger.log('='.repeat(50));
    logger.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    logger.log(`Duration: ${(duration / 1000).toFixed(2)} seconds`);
    logger.log(`Processed entries: ${result.processedEntries}`);
    logger.log(`Conversations created: ${result.conversationsCreated}`);
    logger.log(`Messages created: ${result.messagesCreated}`);
    
    if (result.errors.length > 0) {
      logger.log(`Errors: ${result.errors.length}`);
      logger.log('Error details:');
      result.errors.forEach((error, index) => {
        logger.error(`  ${index + 1}. ${error}`);
      });
    }

    // Close the application
    await app.close();
    
    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    logger.error('Ingestion failed with error:', error.message);
    logger.error(error.stack);
    process.exit(1);
  }
}

function printUsage() {
  console.log(`
Deal Bot Analytics - Data Ingestion CLI

Usage:
  npm run ingest [options]
  ts-node src/cli/ingestion.command.ts [options]

Options:
  --prefix=<prefix>    Only process S3 objects with the specified prefix
  --help, -h          Show this help message

Examples:
  npm run ingest                           # Process all S3 objects
  npm run ingest -- --prefix=logs/2024/   # Process only objects starting with 'logs/2024/'
  
Environment Variables Required:
  AWS_ACCESS_KEY_ID      - AWS access key
  AWS_SECRET_ACCESS_KEY  - AWS secret key
  AWS_REGION            - AWS region (default: us-east-1)
  S3_BUCKET_NAME        - S3 bucket name containing logs
  DATABASE_URL          - PostgreSQL connection string

Note: Make sure your database is running and properly configured before starting ingestion.
`);
}

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.message);
  logger.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
main(); 