import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message } from '../database/entities';
import { SearchConversationsDto } from './dto/search-conversations.dto';
import { ConversationDetailDto, MessageDto } from './dto/conversation-detail.dto';
import { ConversationSummaryDto } from './dto/conversation-filter.dto';
import { PaginatedResponseDto, PaginationMetaDto } from './dto/pagination.dto';
import { 
  IConversationSearchFilter, 
  IConversationSearchOptions,
  ISearchResult 
} from './interfaces/search-result.interface';

interface SearchQuery {
  query?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async searchConversations(searchQuery: SearchQuery) {
    const { page = 1, limit = 10, sortBy = 'started_at', sortOrder = 'DESC' } = searchQuery;
    
    // Build the search filter and options
    const filter: IConversationSearchFilter = {};
    
    if (searchQuery.query) {
      filter.search = searchQuery.query;
    }
    
    if (searchQuery.startDate) {
      filter.startDate = new Date(searchQuery.startDate);
    }
    
    if (searchQuery.endDate) {
      filter.endDate = new Date(searchQuery.endDate);
    }

    // Validate sortOrder to ensure it's either 'ASC' or 'DESC'
    const validSortOrder: 'ASC' | 'DESC' = (sortOrder === 'ASC' || sortOrder === 'DESC') 
      ? sortOrder 
      : 'DESC';

    const options: IConversationSearchOptions = {
      page,
      limit,
      sortBy,
      sortOrder: validSortOrder,
    };

    // Use the real database query instead of mock data
    const result = await this.performSearch(filter, options);
    const conversations = await this.enrichConversationSummaries(result.data);

    return {
      data: conversations,
      page,
      limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }

  async getConversationDetail(id: string) {
    // Find the conversation with its messages
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    // Sort messages by timestamp
    const sortedMessages = conversation.messages?.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ) || [];

    // Convert to DTOs
    const messageDtos: MessageDto[] = sortedMessages.map(message => ({
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      responseTimeMs: message.response_time_ms,
      hasResults: message.has_results,
      metadata: message.metadata,
    }));

    const conversationDetail: ConversationDetailDto = {
      id: conversation.id,
      userId: conversation.user_id,
      startedAt: conversation.started_at,
      endedAt: conversation.ended_at,
      totalMessages: conversation.total_messages,
      satisfactionScore: conversation.satisfaction_score ? parseFloat(conversation.satisfaction_score.toString()) : undefined,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      messages: messageDtos,
    };

    return {
      data: conversationDetail,
      status: 'success',
    };
  }

  async browseConversations(
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'started_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<PaginatedResponseDto<ConversationSummaryDto>> {
    const filter: IConversationSearchFilter = {};
    const options: IConversationSearchOptions = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    const result = await this.performSearch(filter, options);
    const conversations = await this.enrichConversationSummaries(result.data);

    const meta: PaginationMetaDto = {
      currentPage: page,
      totalPages: Math.ceil(result.total / limit),
      totalItems: result.total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(result.total / limit),
      hasPrevPage: page > 1,
    };

    return {
      data: conversations,
      meta,
    };
  }

  private async performSearch(
    filter: IConversationSearchFilter,
    options: IConversationSearchOptions
  ): Promise<ISearchResult<Conversation>> {
    const queryBuilder = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'message');

    // Apply filters
    if (filter.userId) {
      queryBuilder.andWhere('conversation.user_id = :userId', {
        userId: filter.userId,
      });
    }

    if (filter.startDate) {
      queryBuilder.andWhere('conversation.started_at >= :startDate', {
        startDate: filter.startDate,
      });
    }

    if (filter.endDate) {
      queryBuilder.andWhere('conversation.started_at <= :endDate', {
        endDate: filter.endDate,
      });
    }

    if (filter.minMessages) {
      queryBuilder.andWhere('conversation.total_messages >= :minMessages', {
        minMessages: filter.minMessages,
      });
    }

    if (filter.maxMessages) {
      queryBuilder.andWhere('conversation.total_messages <= :maxMessages', {
        maxMessages: filter.maxMessages,
      });
    }

    if (filter.minSatisfaction) {
      queryBuilder.andWhere('conversation.satisfaction_score >= :minSatisfaction', {
        minSatisfaction: filter.minSatisfaction,
      });
    }

    if (filter.maxSatisfaction) {
      queryBuilder.andWhere('conversation.satisfaction_score <= :maxSatisfaction', {
        maxSatisfaction: filter.maxSatisfaction,
      });
    }

    // Full-text search across message content
    if (filter.search) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = conversation.id AND LOWER(m.content) LIKE LOWER(:search))',
        { search: `%${filter.search}%` }
      );
    }

    // Apply sorting
    const allowedSortFields = ['started_at', 'ended_at', 'total_messages', 'satisfaction_score'];
    const sortField = allowedSortFields.includes(options.sortBy) 
      ? `conversation.${options.sortBy}` 
      : 'conversation.started_at';

    // Ensure sortOrder is valid for TypeORM
    const validSortOrder = (options.sortOrder === 'ASC' || options.sortOrder === 'DESC') 
      ? options.sortOrder 
      : 'DESC';

    queryBuilder.orderBy(sortField, validSortOrder);

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (options.page - 1) * options.limit;
    queryBuilder.skip(skip).take(options.limit);

    // Execute query
    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  private async enrichConversationSummaries(
    conversations: Conversation[]
  ): Promise<any[]> {
    const summaries: any[] = [];

    for (const conversation of conversations) {
      // Get first and last messages for preview
      const firstMessage = await this.messageRepository.findOne({
        where: { 
          conversation_id: conversation.id,
          role: 'user' 
        },
        order: { timestamp: 'ASC' },
      });

      const lastMessage = await this.messageRepository.findOne({
        where: { conversation_id: conversation.id },
        order: { timestamp: 'DESC' },
      });

      // Calculate duration
      let duration: number | undefined;
      if (conversation.started_at && conversation.ended_at) {
        duration = Math.round(
          (conversation.ended_at.getTime() - conversation.started_at.getTime()) / (1000 * 60)
        );
      }

      // Return snake_case format to match frontend types
      summaries.push({
        id: conversation.id,
        user_id: conversation.user_id,
        started_at: conversation.started_at?.toISOString(),
        ended_at: conversation.ended_at?.toISOString(),
        total_messages: conversation.total_messages,
        satisfaction_score: conversation.satisfaction_score 
          ? parseFloat(conversation.satisfaction_score.toString()) 
          : undefined,
        created_at: conversation.created_at?.toISOString(),
        updated_at: conversation.updated_at?.toISOString(),
        duration,
        first_message: firstMessage?.content.substring(0, 100),
        last_message: lastMessage?.content.substring(0, 100),
      });
    }

    return summaries;
  }

  private buildSearchFilter(searchDto: SearchConversationsDto): IConversationSearchFilter {
    const filter: IConversationSearchFilter = {};

    if (searchDto.search) {
      filter.search = searchDto.search;
    }

    if (searchDto.userId) {
      filter.userId = searchDto.userId;
    }

    if (searchDto.startDate) {
      filter.startDate = new Date(searchDto.startDate);
    }

    if (searchDto.endDate) {
      filter.endDate = new Date(searchDto.endDate);
    }

    if (searchDto.minMessages) {
      filter.minMessages = searchDto.minMessages;
    }

    if (searchDto.maxMessages) {
      filter.maxMessages = searchDto.maxMessages;
    }

    if (searchDto.minSatisfaction) {
      filter.minSatisfaction = searchDto.minSatisfaction;
    }

    if (searchDto.maxSatisfaction) {
      filter.maxSatisfaction = searchDto.maxSatisfaction;
    }

    return filter;
  }

  private buildSearchOptions(searchDto: SearchConversationsDto): IConversationSearchOptions {
    return {
      page: searchDto.page || 1,
      limit: searchDto.limit || 20,
      sortBy: searchDto.sortBy || 'started_at',
      sortOrder: searchDto.sortOrder || 'DESC',
    };
  }
} 