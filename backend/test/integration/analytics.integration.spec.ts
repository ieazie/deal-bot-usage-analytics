import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { Conversation, Message } from '../../src/database/entities';

describe('Analytics API Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    if (dataSource && dataSource.isInitialized) {
      const entities = dataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.clear();
      }
    }
  });

  describe('/analytics/overview (GET)', () => {
    it('should return empty overview when no data exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/overview')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.totalQueries).toBe(0);
      expect(response.body.data.totalConversations).toBe(0);
      expect(response.body.data.averageResponseTime).toBe(0);
      expect(response.body.data.successRate).toBe(0);
    });

    it('should return correct overview metrics with sample data', async () => {
      // Create test data
      const conversationRepo = dataSource.getRepository(Conversation);
      const messageRepo = dataSource.getRepository(Message);

      const conversation = conversationRepo.create({
        user_id: 'user-1',
        started_at: new Date('2024-01-15T10:00:00Z'),
        ended_at: new Date('2024-01-15T10:05:00Z'),
        total_messages: 2,
        satisfaction_score: 8,
      });
      await conversationRepo.save(conversation);

      const message1 = messageRepo.create({
        conversation_id: conversation.id,
        role: 'user',
        content: 'Test question',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        has_results: true,
      });

      const message2 = messageRepo.create({
        conversation_id: conversation.id,
        role: 'assistant',
        content: 'Test response',
        timestamp: new Date('2024-01-15T10:00:01Z'),
        response_time_ms: 1000,
        has_results: true,
      });

      await messageRepo.save([message1, message2]);

      // Test the endpoint
      const response = await request(app.getHttpServer())
        .get('/analytics/overview')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.totalQueries).toBe(2);
      expect(response.body.data.totalConversations).toBe(1);
      expect(response.body.data.averageResponseTime).toBe(1000);
      expect(response.body.data.successRate).toBe(1); // All messages have results
      expect(response.body.data.averageSatisfactionScore).toBe(8);
    });

    it('should accept date range parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/overview')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('/analytics/query-counts (GET)', () => {
    it('should return empty time series when no data exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/query-counts')
        .query({
          startDate: '2024-01-15',
          endDate: '2024-01-17'
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(3); // 3 days
      expect(response.body.data[0].value).toBe(0);
    });

    it('should return correct query counts with sample data', async () => {
      // Create test data
      const conversationRepo = dataSource.getRepository(Conversation);
      const messageRepo = dataSource.getRepository(Message);

      const conversation = conversationRepo.create({
        user_id: 'user-1',
        started_at: new Date('2024-01-15T10:00:00Z'),
        total_messages: 3,
      });
      await conversationRepo.save(conversation);

      const messages = [
        { timestamp: new Date('2024-01-15T10:00:00Z') },
        { timestamp: new Date('2024-01-15T11:00:00Z') },
        { timestamp: new Date('2024-01-16T10:00:00Z') },
      ].map(data => messageRepo.create({
        ...data,
        conversation_id: conversation.id,
        role: 'user',
        content: 'Test message',
        has_results: true,
      }));

      await messageRepo.save(messages);

      const response = await request(app.getHttpServer())
        .get('/analytics/query-counts')
        .query({
          startDate: '2024-01-15',
          endDate: '2024-01-16'
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].date).toBe('2024-01-15');
      expect(response.body.data[0].value).toBe(2); // 2 messages on 15th
      expect(response.body.data[1].date).toBe('2024-01-16');
      expect(response.body.data[1].value).toBe(1); // 1 message on 16th
    });
  });

  describe('/analytics/common-topics (GET)', () => {
    it('should return topic analysis with sample data', async () => {
      // Create test data with various topics
      const conversationRepo = dataSource.getRepository(Conversation);
      const messageRepo = dataSource.getRepository(Message);

      const conversation = conversationRepo.create({
        user_id: 'user-1',
        started_at: new Date('2024-01-15T10:00:00Z'),
        total_messages: 3,
      });
      await conversationRepo.save(conversation);

      const messages = [
        { content: 'What is the pricing for your service?' },
        { content: 'I have an error with my account' },
        { content: 'How much does the premium plan cost?' },
      ].map((data, index) => messageRepo.create({
        conversation_id: conversation.id,
        role: 'user',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        has_results: true,
        ...data,
      }));

      await messageRepo.save(messages);

      const response = await request(app.getHttpServer())
        .get('/analytics/common-topics')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Should find pricing-related topics
      const pricingTopic = response.body.data.find(topic => 
        topic.topic === 'Pricing Questions'
      );
      expect(pricingTopic).toBeDefined();
      expect(pricingTopic.count).toBe(2); // Two pricing-related messages
    });
  });

  describe('/analytics/response-times (GET)', () => {
    it('should return response time distribution', async () => {
      // Create test data with response times
      const conversationRepo = dataSource.getRepository(Conversation);
      const messageRepo = dataSource.getRepository(Message);

      const conversation = conversationRepo.create({
        user_id: 'user-1',
        started_at: new Date('2024-01-15T10:00:00Z'),
        total_messages: 2,
      });
      await conversationRepo.save(conversation);

      const assistantMessage = messageRepo.create({
        conversation_id: conversation.id,
        role: 'assistant',
        content: 'Response',
        timestamp: new Date('2024-01-15T10:00:01Z'),
        response_time_ms: 1500, // 1.5 seconds
        has_results: true,
      });
      await messageRepo.save(assistantMessage);

      const response = await request(app.getHttpServer())
        .get('/analytics/response-times')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Should have response time ranges
      const range1to2s = response.body.data.find(range => 
        range.range === '1-2s'
      );
      expect(range1to2s).toBeDefined();
      expect(range1to2s.count).toBe(1);
    });

    it('should handle no response time data', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/response-times')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.message).toContain('No response time data available');
    });
  });

  describe('/analytics/no-results-queries (GET)', () => {
    it('should return queries with no results', async () => {
      // Create test data with failed queries
      const conversationRepo = dataSource.getRepository(Conversation);
      const messageRepo = dataSource.getRepository(Message);

      const conversation = conversationRepo.create({
        user_id: 'user-1',
        started_at: new Date('2024-01-15T10:00:00Z'),
        total_messages: 2,
      });
      await conversationRepo.save(conversation);

      const failedMessage = messageRepo.create({
        conversation_id: conversation.id,
        role: 'user',
        content: 'Query that returned no results',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        has_results: false, // This query failed
      });
      await messageRepo.save(failedMessage);

      const response = await request(app.getHttpServer())
        .get('/analytics/no-results-queries')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid date parameters gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/analytics/overview')
        .query({
          startDate: 'invalid-date',
          endDate: '2024-01-31'
        })
        .expect(200);

      // Should still return a response, using default dates
      expect(response.body.status).toBe('success');
    });

    it('should return 404 for non-existent endpoints', async () => {
      await request(app.getHttpServer())
        .get('/analytics/non-existent')
        .expect(404);
    });
  });
}); 