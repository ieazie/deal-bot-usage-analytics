import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../../../src/analytics/analytics.service';
import { Conversation, Message } from '../../../src/database/entities';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let conversationRepository: Repository<Conversation>;
  let messageRepository: Repository<Message>;

  const createMockQueryBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
  });

  const mockConversationRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
  };

  const mockMessageRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Conversation),
          useValue: mockConversationRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    conversationRepository = module.get<Repository<Conversation>>(
      getRepositoryToken(Conversation),
    );
    messageRepository = module.get<Repository<Message>>(
      getRepositoryToken(Message),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('should return overview metrics with correct calculations', async () => {
      // Arrange
      const mockData = {
        totalConversations: 10,
        totalMessages: 25,
        avgResponseTime: { avg: '1250.5' },
        successfulMessages: { count: '20' },
        satisfactionAvg: { avg: '7.5' },
      };

      mockConversationRepository.count.mockResolvedValue(mockData.totalConversations);
      mockMessageRepository.count.mockResolvedValue(mockData.totalMessages);
      
      // Mock chained query builder calls
      const mockQueryBuilder = createMockQueryBuilder();
      
      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockConversationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce(mockData.avgResponseTime)
        .mockResolvedValueOnce(mockData.successfulMessages)
        .mockResolvedValueOnce(mockData.satisfactionAvg);

      // Act
      const result = await service.getOverview({});

      // Assert
      expect(result.status).toBe('success');
      expect(result.data.totalQueries).toBe(25);
      expect(result.data.totalConversations).toBe(10);
      expect(result.data.averageResponseTime).toBe(1251); // Rounded
      expect(result.data.successRate).toBe(0.8); // 20/25
      expect(result.data.noResultsRate).toBeCloseTo(0.2); // Use toBeCloseTo for floating point
      expect(result.data.averageSatisfactionScore).toBe(7.5);
    });

    it('should handle missing data gracefully', async () => {
      // Arrange
      mockConversationRepository.count.mockResolvedValue(0);
      mockMessageRepository.count.mockResolvedValue(0);
      
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue(null);
      
      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockConversationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getOverview({});

      // Assert
      expect(result.data.totalQueries).toBe(0);
      expect(result.data.averageResponseTime).toBe(0);
      expect(result.data.successRate).toBe(0);
      expect(result.data.averageSatisfactionScore).toBe(0);
    });
  });

  describe('getQueryCounts', () => {
    it('should return time series data with filled gaps', async () => {
      // Arrange
      const startDate = '2024-01-15';
      const endDate = '2024-01-17';
      const mockData = [
        { date: '2024-01-15', value: '5' },
        { date: '2024-01-17', value: '3' },
      ];

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawMany.mockResolvedValue(mockData);

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getQueryCounts({ startDate, endDate });

      // Assert
      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(3); // 3 days
      expect(result.data[0]).toEqual({ date: '2024-01-15', value: 5 });
      expect(result.data[1]).toEqual({ date: '2024-01-16', value: 0 }); // Filled gap
      expect(result.data[2]).toEqual({ date: '2024-01-17', value: 3 });
    });

    it('should use default date range when no dates provided', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getQueryCounts({});

      // Assert
      expect(result.status).toBe('success');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'message.timestamp >= :startDate',
        expect.any(Object),
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'message.timestamp <= :endDate',
        expect.any(Object),
      );
    });
  });

  describe('getCommonTopics', () => {
    it('should analyze message content for topic keywords', async () => {
      // Arrange
      const mockMessages = [
        { content: 'What is the pricing for your API service?' },
        { content: 'I am experiencing an error with login' },
        { content: 'How to set up my account properly?' },
        { content: 'API integration guide needed' },
        { content: 'General question about pricing' },
      ];

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue(mockMessages);

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getCommonTopics({});

      // Assert
      expect(result.status).toBe('success');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      
      // Check that pricing questions are properly counted
      const pricingTopic = result.data.find(item => item.topic === 'Pricing Questions');
      expect(pricingTopic?.count).toBe(2); // Two messages about pricing
      expect(pricingTopic?.percentage).toBe(40); // 2/5 * 100
    });

    it('should handle empty message content', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue([]);

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getCommonTopics({});

      // Assert
      expect(result.status).toBe('success');
      expect(result.data).toBeInstanceOf(Array);
      result.data.forEach(item => {
        expect(item.count).toBe(0);
        expect(item.percentage).toBe(0);
      });
    });
  });

  describe('getResponseTimes', () => {
    it('should calculate response time distribution correctly', async () => {
      // Arrange
      const mockMessages = [
        { response_time_ms: 1000 },
        { response_time_ms: 1500 },
        { response_time_ms: 2000 },
        { response_time_ms: 2500 },
        { response_time_ms: 3000 },
      ];

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue(mockMessages);

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getResponseTimes({});

      // Assert
      expect(result.status).toBe('success');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      
      // Check that each range has the expected structure
      result.data.forEach(item => {
        expect(item).toHaveProperty('range');
        expect(item).toHaveProperty('count');
        expect(item).toHaveProperty('percentage');
        expect(item).toHaveProperty('averageTime');
      });
      
      // Check that the total count matches our input
      const totalResponses = result.data.map((item: any) => item.count).reduce((sum: number, count: number) => sum + count, 0);
      expect(totalResponses).toBe(5);
    });

    it('should handle no response time data available', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue([]);

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getResponseTimes({});

      // Assert
      expect(result.data).toEqual([]);
      expect(result.message).toContain('No response time data available');
    });
  });

  describe('getNoResultsQueries', () => {
    it('should return queries that had no results', async () => {
      // Arrange
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      
      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getNoResultsQueries({});

      // Assert
      expect(result.status).toBe('success');
      expect(result.data).toEqual([]);
      expect(result.message).toContain('No queries with failed results found');
    });
  });
}); 