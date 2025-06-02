# Deal Bot Analytics Frontend

This is the frontend application for the Deal Bot Usage Analytics platform, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Phase 4 Implementation Complete ✅

#### 1. Dashboard
- **Metrics Overview**: Key statistics cards showing total queries, conversations, response times, and success rates
- **Time Series Charts**: Query volume trends over time using Recharts
- **Bar Charts**: Most common topics and categories
- **Date Range Filters**: Filter all metrics by custom date ranges
- **Quick Actions**: Navigation shortcuts to other sections

#### 2. Conversation Browser
- **Search Functionality**: Full-text search across conversation content
- **Advanced Filters**: Date range, sorting options (date, relevance, response time, satisfaction)
- **Pagination**: Efficient navigation through large datasets
- **Conversation List**: Clean, card-based layout with key metadata
- **Drill-down**: Click to view full conversation details

#### 3. Conversation Detail View
- **Message Timeline**: Chronological display of user and assistant messages
- **Metadata Display**: Response times, satisfaction scores, result indicators
- **Visual Indicators**: Color-coded satisfaction scores and result status
- **Navigation**: Easy back navigation to conversation list

#### 4. Search Interface
- **Dedicated Search Page**: Clean search interface with suggestions
- **Quick Search Examples**: Pre-defined search terms for common queries
- **URL Integration**: Search terms reflected in URL for bookmarking

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Query (TanStack Query)
- **UI Components**: Custom components with Headless UI patterns

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Analytics dashboard
│   ├── conversations/     # Conversation browser and detail
│   ├── search/           # Search interface
│   └── layout.tsx        # Root layout with providers
├── components/           # Reusable React components
│   ├── ui/              # Base UI components (Button, Card, Input, etc.)
│   ├── layout/          # Layout components (Header, Navigation)
│   ├── charts/          # Chart components (MetricsCard, TimeSeriesChart, BarChart)
│   ├── dashboard/       # Dashboard-specific components
│   └── conversations/   # Conversation-related components
├── hooks/               # Custom React hooks
│   ├── use-analytics.ts # Analytics data fetching
│   └── use-conversations.ts # Conversation data fetching
├── lib/                 # Utility libraries
│   ├── api.ts          # API client configuration
│   ├── types.ts        # TypeScript type definitions
│   └── utils.ts        # Utility functions
└── providers/          # React context providers
    └── query-provider.tsx # React Query provider
```

## Key Components

### Dashboard Components
- `MetricsOverview`: Displays key statistics cards
- `TimeSeriesChart`: Line charts for trends over time
- `BarChartComponent`: Bar charts for categorical data
- `MetricsCard`: Individual metric display cards

### Conversation Components
- `ConversationList`: Paginated list of conversations
- `ConversationFilters`: Search and filter interface
- `ConversationDetailComponent`: Full conversation view with messages
- `Pagination`: Navigation component for large datasets

### UI Components
- `Button`: Reusable button with variants
- `Card`: Container component for content panels
- `Input`: Form input with label and error support
- `Header`: Main navigation header

## Data Flow

1. **API Client**: Centralized API communication with error handling
2. **React Query**: Server state management with caching and background updates
3. **Custom Hooks**: Abstracted data fetching logic
4. **Components**: Pure presentation components with loading and error states

## Features Implemented

### ✅ Dashboard
- [x] Metrics overview cards with change indicators
- [x] Time series charts for query trends
- [x] Bar charts for common topics
- [x] Date range filtering
- [x] Loading states and error handling
- [x] Responsive design

### ✅ Conversation Browser
- [x] Search functionality with debouncing
- [x] Advanced filtering (date, sorting, etc.)
- [x] Pagination with page size options
- [x] Conversation cards with metadata
- [x] Empty states and error handling
- [x] URL parameter integration for search

### ✅ Conversation Detail
- [x] Message timeline display
- [x] User/Assistant message differentiation
- [x] Response time and satisfaction indicators
- [x] Metadata display with collapsible sections
- [x] Navigation back to list

### ✅ Search Interface
- [x] Dedicated search page
- [x] Quick search suggestions
- [x] Integration with conversation browser
- [x] URL-based search parameters

## Performance Optimizations

- **React Query Caching**: 5-minute stale time for analytics data
- **Debounced Search**: 500ms delay to reduce API calls
- **Pagination**: Efficient data loading with configurable page sizes
- **Loading States**: Skeleton screens for better UX
- **Error Boundaries**: Graceful error handling

## Responsive Design

- **Mobile-first**: Tailwind CSS responsive utilities
- **Flexible Layouts**: Grid and flexbox for various screen sizes
- **Touch-friendly**: Appropriate button sizes and spacing
- **Readable Typography**: Optimized font sizes and line heights

## Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Type checking
npm run type-check
```

## API Integration

The frontend expects the backend API to provide these endpoints:

### Analytics Endpoints
- `GET /analytics/overview` - Metrics overview
- `GET /analytics/query-counts` - Time series data
- `GET /analytics/common-topics` - Topic frequency data
- `GET /analytics/response-times` - Response time metrics
- `GET /analytics/no-results` - Queries with no results

### Conversation Endpoints
- `GET /conversations/search` - Paginated conversation search
- `GET /conversations/:id` - Individual conversation details

All endpoints support query parameters for filtering (startDate, endDate, etc.).

## Next Steps

The Phase 4 frontend implementation is complete and ready for integration with the backend API. The interface provides a comprehensive analytics platform for monitoring Deal Bot usage patterns and conversation data. 