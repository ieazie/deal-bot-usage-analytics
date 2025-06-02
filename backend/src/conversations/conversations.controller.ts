import { Controller, Get, Query, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { SearchConversationsDto } from './dto/search-conversations.dto';

@ApiTags('conversations')
@Controller('conversations')
@UsePipes(new ValidationPipe({ transform: true }))
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  /**
   * Search conversations with filters
   * Supports full-text search across message content
   */
  @Get('search')
  @ApiOperation({
    summary: 'Search conversations',
    description: 'Advanced search for conversations with full-text search across message content and various filters'
  })
  async searchConversations(
    @Query('query') query?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.conversationsService.searchConversations({
      query,
      startDate,
      endDate,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sortBy,
      sortOrder,
    });
  }

  /**
   * Browse conversations with pagination
   * Basic listing without complex filters
   */
  @Get()
  @ApiOperation({
    summary: 'Browse conversations',
    description: 'Browse all conversations with pagination and basic sorting options'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC or DESC)' })
  async browseConversations(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC'
  ) {
    return this.conversationsService.browseConversations(
      page,
      limit,
      sortBy,
      sortOrder
    );
  }

  /**
   * Get conversation details with all messages
   * Includes full conversation thread
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get conversation details',
    description: 'Retrieve detailed information about a specific conversation including all messages'
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async getConversationDetail(@Param('id') id: string) {
    return this.conversationsService.getConversationDetail(id);
  }
} 