import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create app with the actual AppModule that contains all routes
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Standard development frontend
      'http://localhost:5050',  // Current frontend port
      'http://localhost:7000',  // Alternative frontend port
      'http://localhost:7001',  // Alternative frontend port
      'http://frontend:3000',   // Docker frontend
      'http://frontend:7000',   // Docker frontend alternative
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // API documentation with Swagger
  const config = new DocumentBuilder()
    .setTitle('Deal Bot Analytics API')
    .setDescription('API for Deal Bot usage analytics and conversation monitoring')
    .setVersion('1.0')
    .addTag('analytics', 'Analytics and metrics endpoints')
    .addTag('conversations', 'Conversation management and search')
    .addTag('ingestion', 'Data ingestion from S3')
    .addTag('health', 'Health check and status endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 7000;  // Port 7000 as per plan
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`❤️ Health check available at: http://localhost:${port}/health`);
  console.log(`📚 API docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();