import { Injectable, Logger } from '@nestjs/common';
import { CloudWatchLogEntry, ParsedLogEntry } from './interfaces/log-entry.interface';

@Injectable()
export class LogParserService {
  private readonly logger = new Logger(LogParserService.name);

  /**
   * Parses CloudWatch log content and extracts structured log entries
   */
  parseLogContent(content: string): CloudWatchLogEntry[] {
    const parsedEntries: CloudWatchLogEntry[] = [];

    try {
      // Try to parse the entire content as JSON array first
      const jsonData = JSON.parse(content);
      
      if (Array.isArray(jsonData)) {
        // Handle JSON array format
        for (const entry of jsonData) {
          const cloudWatchEntry = this.convertToCloudWatchEntry(entry);
          if (cloudWatchEntry) {
            parsedEntries.push(cloudWatchEntry);
          }
        }
      } else {
        // Handle single JSON object
        const cloudWatchEntry = this.convertToCloudWatchEntry(jsonData);
        if (cloudWatchEntry) {
          parsedEntries.push(cloudWatchEntry);
        }
      }
    } catch (error) {
      // If not JSON, try line-by-line parsing
      const lines = content.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const cloudWatchEntry = this.convertToCloudWatchEntry(parsed);
          if (cloudWatchEntry) {
            parsedEntries.push(cloudWatchEntry);
          }
        } catch (lineError) {
          // Create basic entry from non-JSON line
          const basicEntry = this.createBasicLogEntry(line);
          parsedEntries.push(basicEntry);
        }
      }
    }

    this.logger.log(`Parsed ${parsedEntries.length} log entries from content`);
    return parsedEntries;
  }

  /**
   * Convert service log entry to CloudWatch log entry format
   */
  private convertToCloudWatchEntry(entry: any): CloudWatchLogEntry | null {
    try {
      // Handle the actual log format from your service
      if (entry.timestamp && entry.message) {
        return {
          timestamp: entry.timestamp,
          message: entry.message,
          level: entry.level,
          // Extract relevant metadata
          metadata: {
            dealId: entry.dealId,
            cacheKey: entry.cacheKey,
            context: entry.context,
            requestId: entry.req?.id,
            userId: this.extractUserFromRequest(entry.req),
            conversationId: entry.dealId, // Use dealId as conversation identifier
            hostname: entry.hostname,
            pid: entry.pid,
            method: entry.req?.method,
            url: entry.req?.url,
            userAgent: entry.req?.headers?.['user-agent'],
            applicationId: entry.req?.headers?.['x-application-id'],
          }
        };
      }
      
      // return null;
    } catch (error) {
      this.logger.warn(`Failed to convert service log entry: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract user identifier from request object
   */
  private extractUserFromRequest(req: any): string | null {
    if (!req) return null;

    // Try to extract user from authorization header
    const authHeader = req.headers?.authorization;
    if (authHeader) {
      // Extract token or user info from Bearer token
      const tokenMatch = authHeader.match(/Bearer\s+([^.]+)/);
      if (tokenMatch) {
        return `user_${tokenMatch[1].substring(0, 8)}`; // Use first 8 chars of token as user ID
      }
    }

    // Try application ID
    const appId = req.headers?.['x-application-id'];
    if (appId) {
      return appId;
    }

    // Use request ID if no other identifier
    return req.id ? `req_${req.id}` : null;
  }

  /**
   * Transforms CloudWatch log entries into structured conversation data
   */
  parseLogEntries(logEntries: CloudWatchLogEntry[]): ParsedLogEntry[] {
    const conversations = new Map<string, ParsedLogEntry>();
    const parsedEntries: ParsedLogEntry[] = [];

    for (const entry of logEntries) {
      try {
        const parsed = this.parseLogEntry(entry);
        
        if (parsed) {
          // Check if we already have a conversation with this ID
          const existingConversation = conversations.get(parsed.conversationId);
          
          if (existingConversation) {
            // Add message to existing conversation (this would be handled differently in practice)
            parsedEntries.push(parsed);
          } else {
            // New conversation
            conversations.set(parsed.conversationId, parsed);
            parsedEntries.push(parsed);
          }
        } else {
          this.logger.warn(`Failed to parse log entry - no conversation/user ID found`);
        }
      } catch (error) {
        this.logger.warn(`Failed to parse log entry: ${error.message}`, { entry });
      }
    }

    this.logger.log(`Extracted ${parsedEntries.length} structured entries from ${logEntries.length} log entries`);
    return parsedEntries;
  }

  /**
   * Parse a single log entry into structured conversation data
   */
  private parseLogEntry(entry: CloudWatchLogEntry): ParsedLogEntry | null {
    try {
      // Skip non-conversational logs (API requests, system logs, etc.)
      if (this.isNonConversationalLog(entry)) {
        return null;
      }

      // Extract conversation and user IDs
      const conversationId = this.extractConversationId(entry);
      const userId = this.extractUserId(entry);

      if (!conversationId || !userId) {
        return null;
      }

      // Parse the message content to determine if it's user or assistant
      const message = this.parseMessage(entry);

      if (!message) {
        return null;
      }

      // Extract satisfaction score if available
      const satisfactionScore = this.extractSatisfactionScore(entry);

      return {
        conversationId,
        userId,
        message,
        satisfactionScore,
      };
    } catch (error) {
      this.logger.warn(`Error parsing log entry: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if this is a non-conversational log that should be skipped
   */
  private isNonConversationalLog(entry: CloudWatchLogEntry): boolean {
    const message = entry.message.toLowerCase();
    
    // DO NOT skip Deal Bot service logs - these are conversational!
    if (entry.metadata?.context === 'DealBotService') {
      return false; // Always include Deal Bot logs
    }
    
    // Skip generic API request logs (not Deal Bot related)
    if (message.includes('processing get request') && 
        !message.includes('bot') && 
        !message.includes('deal')) {
      return true;
    }
    
    if (message.includes('request processed') && 
        !message.includes('bot') && 
        !message.includes('deal')) {
      return true;
    }
    
    // Skip system startup logs
    if (message.includes('server started') ||
        message.includes('database connected') ||
        message.includes('application started')) {
      return true;
    }

    // Skip if the message looks like a URL or API endpoint (not Deal Bot)
    if (message.match(/^\/[a-z0-9\/\-_]+$/i) && 
        !message.includes('bot') && 
        !message.includes('deal')) {
      return true;
    }

    return false;
  }

  /**
   * Extract conversation ID from log entry
   */
  private extractConversationId(entry: CloudWatchLogEntry): string | null {
    // Try metadata first (from converted service logs)
    if (entry.metadata?.conversationId) {
      return entry.metadata.conversationId;
    }
    
    if (entry.metadata?.dealId) {
      return entry.metadata.dealId;
    }

    // Try explicit conversationId field
    if (entry.conversationId) {
      return entry.conversationId;
    }

    // Try to extract from metadata
    if (entry.metadata?.dealId) {
      return entry.metadata.dealId;
    }

    // Try to extract from message content using regex patterns
    const patterns = [
      /deal[_\-]?id[:\s]*([a-f0-9\-]{1,})/i,
      /conversation[_\-]?id[:\s]*([a-f0-9\-]{8,})/i,
      /conv[_\-]?id[:\s]*([a-f0-9\-]{8,})/i,
      /"conversation"[:\s]*"([^"]+)"/i,
      /"dealId"[:\s]*"([^"]+)"/i,
    ];

    for (const pattern of patterns) {
      const match = entry.message.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Generate a conversation ID based on request ID if available
    if (entry.requestId || entry.metadata?.requestId) {
      return `conv_${entry.requestId || entry.metadata?.requestId}`;
    }

    return null;
  }

  /**
   * Extract user ID from log entry
   */
  private extractUserId(entry: CloudWatchLogEntry): string | null {
    // Try metadata first (from converted service logs)
    if (entry.metadata?.userId) {
      return entry.metadata.userId;
    }
    
    if (entry.metadata?.applicationId) {
      return entry.metadata.applicationId;
    }

    // Try explicit userId field
    if (entry.userId) {
      return entry.userId;
    }

    // Try to extract from metadata
    if (entry.metadata?.userId) {
      return entry.metadata.userId;
    }

    // Try to extract from message content
    const patterns = [
      /user[_\-]?id[:\s]*([a-f0-9\-]{8,})/i,
      /"user"[:\s]*"([^"]+)"/i,
      /user[:\s]*([a-zA-Z0-9\-_.@]+)/i,
      /application[_\-]?id[:\s]*([a-zA-Z0-9\-_.@]+)/i,
    ];

    for (const pattern of patterns) {
      const match = entry.message.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Default user for service logs
    return 'system';
  }

  /**
   * Parse message content and determine role, content, and metadata
   */
  private parseMessage(entry: CloudWatchLogEntry): ParsedLogEntry['message'] | null {
    try {
      const timestamp = new Date(entry.timestamp);
      
      // Determine if this is a user or assistant message
      const role = this.determineMessageRole(entry);
      
      // Extract the actual message content
      const content = this.extractMessageContent(entry);
      
      if (!content) {
        return null;
      }

      // Extract response time for assistant messages
      const responseTimeMs = role === 'assistant' ? this.extractResponseTime(entry) : undefined;
      
      // Determine if the message has results
      const hasResults = this.determineHasResults(entry);

      // Extract additional metadata
      const metadata = this.extractMessageMetadata(entry);

      return {
        role,
        content,
        timestamp,
        responseTimeMs,
        hasResults,
        metadata,
      };
    } catch (error) {
      this.logger.warn(`Error parsing message: ${error.message}`);
      return null;
    }
  }

  /**
   * Determine if this is a user or assistant message
   * Based on Deal Bot service patterns
   */
  private determineMessageRole(entry: CloudWatchLogEntry): 'user' | 'assistant' {
    const message = entry.message.toLowerCase();
    
    // Deal Bot Service specific logic
    if (entry.metadata?.context === 'DealBotService') {
      // POST requests to bot/query endpoints are user queries
      if (entry.metadata?.method === 'POST' && 
          entry.metadata?.url?.includes('/bot/query')) {
        // This is a user query being processed
        return 'user';
      }
      
      // Check for query-related messages that indicate user input
      if (message.includes('processing deal bot query') ||
          message.includes('user query') ||
          message.includes('query received') ||
          message.includes('bot query')) {
        return 'user';
      }
      
      // Everything else in DealBotService context is bot processing/response
      return 'assistant';
    }
    
    // Check for explicit role indicators
    if (message.includes('user:') || message.includes('"role":"user"')) {
      return 'user';
    }
    
    if (message.includes('assistant:') || message.includes('"role":"assistant"') || 
        message.includes('bot:') || message.includes('response:') ||
        message.includes('context invalidated') || message.includes('cache')) {
      return 'assistant';
    }

    // Check for response indicators (bot actions)
    if (message.includes('response_time') || message.includes('generated') || 
        message.includes('completion') || message.includes('invalidated') ||
        message.includes('cache') || message.includes('retrieving') ||
        message.includes('attempting') || message.includes('processing')) {
      return 'assistant';
    }

    // API endpoints that are user-initiated
    if (entry.metadata?.method === 'POST' || entry.metadata?.method === 'PUT') {
      return 'user';
    }

    // Default to assistant for service logs
    return 'assistant';
  }

  /**
   * Extract the actual message content from the log entry
   */
  private extractMessageContent(entry: CloudWatchLogEntry): string | null {
    try {
      // Try to parse as structured message first
      const parsed = JSON.parse(entry.message);
      
      if (parsed.content) {
        return parsed.content;
      }
      
      if (parsed.message) {
        return parsed.message;
      }
      
      if (parsed.text) {
        return parsed.text;
      }

      if (parsed.query) {
        return parsed.query;
      }
    } catch {
      // Not JSON, continue with processing
    }

    // Deal Bot specific content extraction
    if (entry.metadata?.context === 'DealBotService') {
      // For user queries (POST to /bot/query)
      if (entry.metadata?.method === 'POST' && 
          entry.metadata?.url?.includes('/bot/query')) {
        // Extract deal context for user query
        const dealId = entry.metadata?.dealId || entry.metadata?.conversationId;
        return `User query about deal ${dealId}`;
      }
      
      // For bot responses, use the actual log message but make it more readable
      const message = entry.message;
      
      // Clean up common service messages
      if (message.includes('Processing deal bot query')) {
        const dealId = entry.metadata?.dealId;
        return `Processing user query for deal ${dealId}`;
      }
      
      if (message.includes('Attempting to retrieve context from cache')) {
        return 'Retrieving deal context from cache';
      }
      
      if (message.includes('Cache hit and context is valid')) {
        return 'Found valid cached deal context';
      }
      
      if (message.includes('Cached document size details')) {
        return 'Retrieved deal document information';
      }
      
      // Return the original message for other cases
      return message;
    }

    // Extract using regex patterns for other log types
    const patterns = [
      /"content"[:\s]*"([^"]+)"/i,
      /"message"[:\s]*"([^"]+)"/i,
      /"text"[:\s]*"([^"]+)"/i,
      /"query"[:\s]*"([^"]+)"/i,
      /content[:\s]*([^\n\r]+)/i,
      /message[:\s]*([^\n\r]+)/i,
    ];

    for (const pattern of patterns) {
      const match = entry.message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // If no structured content found, return the whole message (truncated if too long)
    return entry.message.length > 500 ? 
      entry.message.substring(0, 500) + '...' : 
      entry.message;
  }

  /**
   * Extract response time from assistant messages
   */
  private extractResponseTime(entry: CloudWatchLogEntry): number | undefined {
    const patterns = [
      /response[_\-]?time[:\s]*(\d+)/i,
      /duration[:\s]*(\d+)/i,
      /elapsed[:\s]*(\d+)/i,
      /"responseTime"[:\s]*(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = entry.message.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return undefined;
  }

  /**
   * Determine if the message has results
   */
  private determineHasResults(entry: CloudWatchLogEntry): boolean {
    const message = entry.message.toLowerCase();
    
    // Check for explicit no results indicators
    if (message.includes('no results') || message.includes('no_results') || 
        message.includes('empty results') || message.includes('results: 0')) {
      return false;
    }

    // Check for explicit results indicators
    if (message.includes('results:') || message.includes('found') || 
        message.includes('matches') || message.includes('documents')) {
      return true;
    }

    // Default to true for most messages
    return true;
  }

  /**
   * Extract satisfaction score from log entry
   */
  private extractSatisfactionScore(entry: CloudWatchLogEntry): number | undefined {
    const patterns = [
      /satisfaction[_\-]?score[:\s]*(\d+(?:\.\d+)?)/i,
      /rating[:\s]*(\d+(?:\.\d+)?)/i,
      /score[:\s]*(\d+(?:\.\d+)?)/i,
    ];

    for (const pattern of patterns) {
      const match = entry.message.match(pattern);
      if (match) {
        const score = parseFloat(match[1]);
        return score >= 0 && score <= 5 ? score : undefined;
      }
    }

    return undefined;
  }

  /**
   * Extract additional message metadata
   */
  private extractMessageMetadata(entry: CloudWatchLogEntry): Record<string, any> {
    const metadata: Record<string, any> = {};

    // Include original metadata if available
    if (entry.metadata) {
      Object.assign(metadata, entry.metadata);
    }

    // Add request ID if available
    if (entry.requestId) {
      metadata.requestId = entry.requestId;
    }

    // Add log level if available
    if (entry.level) {
      metadata.level = entry.level;
    }

    return metadata;
  }

  /**
   * Validate if an object is a valid log entry
   */
  private isValidLogEntry(obj: any): obj is CloudWatchLogEntry {
    return obj && 
           typeof obj === 'object' && 
           typeof obj.timestamp === 'string' && 
           typeof obj.message === 'string';
  }

  /**
   * Create a basic log entry from plain text
   */
  private createBasicLogEntry(line: string): CloudWatchLogEntry {
    // Try to extract timestamp from the beginning of the line
    const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})/);
    const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString();
    
    const message = timestampMatch ? line.substring(timestampMatch[0].length).trim() : line;

    return {
      timestamp,
      message,
      level: 'info',
    };
  }
} 