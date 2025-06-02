import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message } from '../database/entities';

interface MetricsQuery {
  startDate?: string;
  endDate?: string;
  granularity?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getOverview(query: MetricsQuery) {
    // Get real data from database
    const [
      totalConversations,
      totalMessages,
      avgResponseTime,
      successfulMessages,
      satisfactionAvg
    ] = await Promise.all([
      this.conversationRepository.count(),
      this.messageRepository.count(),
      this.messageRepository
        .createQueryBuilder('message')
        .select('AVG(message.response_time_ms)', 'avg')
        .where('message.response_time_ms IS NOT NULL')
        .getRawOne(),
      this.messageRepository
        .createQueryBuilder('message')
        .select('COUNT(*)', 'count')
        .where('message.has_results = true')
        .getRawOne(),
      this.conversationRepository
        .createQueryBuilder('conversation')
        .select('AVG(conversation.satisfaction_score)', 'avg')
        .where('conversation.satisfaction_score IS NOT NULL')
        .getRawOne(),
    ]);

    const totalQueries = totalMessages;
    const averageResponseTime = avgResponseTime?.avg ? Math.round(parseFloat(avgResponseTime.avg)) : 0;
    const successfulCount = successfulMessages?.count ? parseInt(successfulMessages.count) : 0;
    const successRate = totalQueries > 0 ? successfulCount / totalQueries : 0;
    const noResultsRate = 1 - successRate;
    const averageSatisfactionScore = satisfactionAvg?.avg ? parseFloat(satisfactionAvg.avg) : 0;

    return {
      data: {
        totalQueries,
        totalConversations,
        averageResponseTime,
        successRate,
        noResultsRate,
        averageSatisfactionScore,
        periodComparison: {
          queriesChange: 0, // Would need historical data for comparison
          responseTimeChange: 0,
          successRateChange: 0,
        },
      },
      status: 'success',
    };
  }

  async getQueryCounts(query: MetricsQuery) {
    // Get real time series data from database
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 30 days ago

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .select("to_char(message.timestamp, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'value')
      .where('message.timestamp >= :startDate', { startDate })
      .andWhere('message.timestamp <= :endDate', { endDate })
      .groupBy("to_char(message.timestamp, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC');

    const results = await queryBuilder.getRawMany();

    // Fill in missing dates with 0 values
    const data = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const found = results.find(r => r.date === dateStr);
      
      data.push({
        date: dateStr,
        value: found ? parseInt(found.value) : 0,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      data,
      status: 'success',
    };
  }

  async getCommonTopics(query: MetricsQuery) {
    // Get real topic data from database by analyzing message content
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Define topic keywords to search for in messages
    const topicKeywords = {
      'Pricing Questions': ['price', 'pricing', 'cost', 'fee', 'billing', 'payment', 'subscription', 'plan'],
      'Technical Support': ['error', 'bug', 'issue', 'problem', 'not working', 'broken', 'fix', 'help'],
      'Product Features': ['feature', 'functionality', 'how to', 'tutorial', 'guide', 'use', 'setup'],
      'Account Setup': ['account', 'setup', 'register', 'sign up', 'login', 'password', 'profile'],
      'API Integration': ['api', 'integration', 'endpoint', 'webhook', 'sdk', 'developer', 'code'],
      'Data Analysis': ['data', 'analytics', 'report', 'dashboard', 'chart', 'graph', 'metric'],
      'Performance Issues': ['slow', 'performance', 'speed', 'timeout', 'latency', 'response time'],
      'Security Questions': ['security', 'auth', 'permission', 'access', 'token', 'ssl', 'encryption'],
      'Mobile App': ['mobile', 'app', 'ios', 'android', 'phone', 'device', 'install'],
      'General Inquiry': ['question', 'info', 'information', 'general', 'inquiry', 'contact']
    };

    const topicCounts = {};
    let totalMessages = 0;

    // Get all user messages in the date range
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .select(['message.content'])
      .where('message.timestamp >= :startDate', { startDate })
      .andWhere('message.timestamp <= :endDate', { endDate })
      .andWhere('message.role = :role', { role: 'user' })
      .getMany();

    totalMessages = messages.length;

    // Initialize topic counts
    Object.keys(topicKeywords).forEach(topic => {
      topicCounts[topic] = 0;
    });

    // Analyze each message for topic keywords
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        const hasKeyword = keywords.some(keyword => 
          content.includes(keyword.toLowerCase())
        );
        
        if (hasKeyword) {
          topicCounts[topic]++;
        }
      });
    });

    // Convert to sorted array with percentages
    const data = Object.entries(topicCounts)
      .map(([topic, count]) => ({
        topic,
        count: count as number,
        percentage: totalMessages > 0 ? Math.round((count as number / totalMessages) * 100 * 10) / 10 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 topics

    return {
      data,
      status: 'success',
    };
  }

  async getResponseTimes(query: MetricsQuery) {
    // Get real response time data from database
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all assistant messages with response times in the date range
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .select(['message.response_time_ms'])
      .where('message.timestamp >= :startDate', { startDate })
      .andWhere('message.timestamp <= :endDate', { endDate })
      .andWhere('message.role = :role', { role: 'assistant' })
      .andWhere('message.response_time_ms IS NOT NULL')
      .getMany();

    // If no response time data is available, return appropriate message
    if (messages.length === 0) {
      return {
        data: [],
        message: 'No response time data available. Response times are not being tracked in the current dataset.',
        status: 'success',
      };
    }

    // Define response time ranges
    const ranges = [
      { range: '0-1s', min: 0, max: 1000 },
      { range: '1-2s', min: 1000, max: 2000 },
      { range: '2-5s', min: 2000, max: 5000 },
      { range: '5-10s', min: 5000, max: 10000 },
      { range: '10s+', min: 10000, max: Infinity },
    ];

    const totalMessages = messages.length;
    const data = ranges.map(rangeConfig => {
      const messagesInRange = messages.filter(message => 
        message.response_time_ms >= rangeConfig.min && 
        message.response_time_ms < rangeConfig.max
      );

      const count = messagesInRange.length;
      const percentage = totalMessages > 0 ? Math.round((count / totalMessages) * 100 * 10) / 10 : 0;
      
      // Calculate average time for this range
      const averageTime = count > 0 
        ? Math.round(messagesInRange.reduce((sum, msg) => sum + msg.response_time_ms, 0) / count)
        : 0;

      return {
        range: rangeConfig.range,
        count,
        percentage,
        averageTime
      };
    });

    return {
      data,
      status: 'success',
    };
  }

  async getNoResultsQueries(query: MetricsQuery) {
    // Get real no-results queries from database
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user messages that resulted in no results (has_results = false)
    const noResultMessages = await this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('conversations', 'conversation', 'conversation.id = message.conversation_id')
      .select([
        'message.content',
        'message.timestamp', 
        'conversation.user_id',
        'message.conversation_id'
      ])
      .where('message.timestamp >= :startDate', { startDate })
      .andWhere('message.timestamp <= :endDate', { endDate })
      .andWhere('message.role = :role', { role: 'user' })
      .andWhere('message.has_results = :hasResults', { hasResults: false })
      .orderBy('message.timestamp', 'DESC')
      .limit(20) // Get most recent 20 no-result queries
      .getRawMany();

    // If no failed queries found, return appropriate message
    if (noResultMessages.length === 0) {
      return {
        data: [],
        message: 'No queries with failed results found. This indicates good performance with all queries returning results.',
        status: 'success',
      };
    }

    const data = noResultMessages.map(msg => ({
      query: msg.message_content.substring(0, 200), // Truncate long queries
      timestamp: new Date(msg.message_timestamp).toISOString(),
      userId: msg.conversation_user_id,
      conversationId: msg.message_conversation_id,
    }));

    return {
      data,
      status: 'success',
    };
  }

  async getLowSatisfactionQueries(query: MetricsQuery) {
    // This would return conversations with low satisfaction scores
    return {
      conversations: [],
      totalCount: 0,
      averageSatisfaction: 0,
      timeRange: `${query.startDate || 'all'} to ${query.endDate || 'now'}`,
    };
  }

  async getPerformanceMetrics(query: MetricsQuery) {
    // This would return performance metrics for the given query
    return {
      // Placeholder for performance metrics
    };
  }
} 