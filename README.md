# Deal Bot Usage Analytics Platform

A comprehensive TypeScript-based analytics platform for monitoring Deal Bot usage, featuring data ingestion from S3, PostgreSQL storage, and a user-friendly web interface for analyzing conversation logs and usage metrics.

## 🚀 Features

- **Data Ingestion**: Automated S3 log processing with batch ingestion
- **Analytics Dashboard**: Real-time metrics and visualizations
- **Conversation Browser**: Search and view conversation details
- **Error Analysis**: Track failed queries and performance issues
- **RESTful API**: Comprehensive analytics endpoints
- **Type Safety**: Full TypeScript implementation
- **Docker Support**: One-command deployment

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 15+ (managed by Docker)
- AWS S3 access credentials

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd deal-bot-usage-analytics
cp .env.example .env
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://analytics_user:analytics_pass@localhost:5432/dealbot_analytics
TEST_DATABASE_URL=postgresql://analytics_user:analytics_pass@localhost:5432/dealbot_analytics_test

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:7000
```

### 3. Start the Application

```bash
# Start all services with Docker Compose
docker-compose up --build

# Or use the Makefile
make docker-up
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:7001
- **PgAdmin**: http://localhost:8080 (admin@dealbot.com / admin123)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│ (PostgreSQL)    │
│   Port: 3000    │    │   Port: 7001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   S3 Service    │    │    PgAdmin      │
│   (Reverse      │    │  (Data Source)  │    │  (DB Manager)   │
│   Proxy)        │    │                 │    │   Port: 8080    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 API Endpoints

### Analytics Endpoints

```
GET /analytics/overview              # Dashboard overview metrics
GET /analytics/query-counts          # Time-series query data
GET /analytics/common-topics         # Topic analysis
GET /analytics/response-times        # Response time distribution
GET /analytics/no-results-queries    # Failed queries
```

### Conversation Endpoints

```
GET /conversations                   # List conversations with pagination
GET /conversations/:id               # Conversation details
GET /conversations/search            # Search conversations
```

### Ingestion Endpoints

```
POST /ingestion/start               # Start data ingestion
GET /ingestion/status               # Ingestion status
GET /ingestion/stats                # Ingestion statistics
```

### Query Parameters

Most endpoints support these optional parameters:

- `startDate`: ISO date string (default: 30 days ago)
- `endDate`: ISO date string (default: now)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

## 🧪 Testing

### Backend Tests

```bash
# Unit tests
cd backend
npm test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Frontend Tests

```bash
# Component tests
cd frontend
npm test

# Test coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Full Test Suite

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage
```

## 🔧 Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run development server
npm run start:dev

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Seed database
npm run seed
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### Database Management

```bash
# Access database directly
docker-compose exec db psql -U analytics_user -d dealbot_analytics

# View logs
docker-compose logs db

# Reset database (caution: deletes all data)
docker-compose down -v
docker-compose up --build
```

## 📥 Data Ingestion

### Manual Ingestion

```bash
# Ingest all logs from S3
npm run ingest

# Ingest with specific prefix
npm run ingest -- --prefix=logs/2024/01/

# CLI help
npm run ingest -- --help
```

### Automated Ingestion

The system supports automated ingestion through:

1. **Scheduled Jobs**: Configure cron jobs to run ingestion periodically
2. **API Endpoints**: Trigger ingestion via REST API
3. **Webhooks**: Set up S3 event notifications

### Ingestion Process

1. **List S3 Objects**: Discovers log files in the specified S3 bucket
2. **Download Content**: Retrieves log files in batches
3. **Parse Logs**: Extracts conversation and message data
4. **Database Storage**: Saves data with transaction safety
5. **Error Handling**: Logs and reports any processing errors

## 🐳 Docker Configuration

### Services

- **Backend**: NestJS API server with automatic migrations
- **Frontend**: Next.js application with optimized production build
- **Database**: PostgreSQL with persistent storage
- **PgAdmin**: Database administration interface
- **Nginx**: Reverse proxy and load balancer (production)

### Development vs Production

```bash
# Development (with hot reload)
docker-compose up

# Production (optimized builds)
docker-compose -f docker-compose.prod.yml up
```

### Docker Commands

```bash
# Build without cache
docker-compose build --no-cache

# View service logs
docker-compose logs -f backend

# Execute commands in containers
docker-compose exec backend npm run migration:run
docker-compose exec db psql -U analytics_user -d dealbot_analytics

# Scale services
docker-compose up --scale backend=2
```



## 📈 Monitoring & Observability

### Application Metrics

- **Response Times**: API endpoint performance
- **Error Rates**: Failed requests and ingestion errors
- **Database Performance**: Query execution times
- **Memory Usage**: Application memory consumption

### Health Checks

```bash
# Application health
curl http://localhost:7001/health

# Database health
curl http://localhost:7001/health/db

# S3 connectivity
curl http://localhost:7001/health/s3
```

### Logging

- **Application Logs**: Structured JSON logging
- **Access Logs**: HTTP request/response logging
- **Error Logs**: Detailed error tracking with stack traces
- **Audit Logs**: Data ingestion and modification tracking

## 🔒 Security

### Environment Variables

- Never commit sensitive environment variables to source control
- Use `.env` files for local development
- Use environment-specific configurations for deployment
- Rotate AWS credentials regularly

### Database Security

- Use strong passwords for database connections
- Restrict database access to application servers only
- Enable SSL/TLS for database connections in production
- Regular security updates for PostgreSQL


### Coding Standards

- **TypeScript**: Use strict type checking
- **ESLint**: Follow configured linting rules
- **Prettier**: Use consistent code formatting
- **Comments**: Document complex business logic
- **Tests**: Write tests for new functionality



## 📋 Available Scripts

### Root Level

```bash
make docker-up          # Start all services
make docker-down        # Stop all services
make test              # Run all tests
make test-coverage     # Run tests with coverage
make clean             # Clean up containers and volumes
make logs              # View all service logs
```

### Backend

```bash
npm run start:dev      # Development server
npm run start:prod     # Production server
npm run test           # Unit tests
npm run test:e2e       # Integration tests
npm run migration:run  # Run database migrations
npm run seed           # Seed database with sample data
npm run ingest         # Run data ingestion
```

### Frontend

```bash
npm run dev            # Development server
npm run build          # Production build
npm run start          # Start production build
npm run test           # Component tests
npm run lint           # Linting
npm run type-check     # TypeScript checking
```

## 📝 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps db
   
   # View database logs
   docker-compose logs db
   
   # Restart database service
   docker-compose restart db
   ```

2. **S3 Access Denied**
   ```bash
   # Verify AWS credentials
   echo $AWS_ACCESS_KEY_ID
   
   # Test S3 connection
   aws s3 ls s3://your-bucket-name --region us-east-1
   ```

3. **Migration Errors**
   ```bash
   # Reset database and run migrations
   docker-compose down -v
   docker-compose up db
   docker-compose exec backend npm run migration:run
   ```

4. **Port Conflicts**
   ```bash
   # Check port usage
   lsof -i :3000
   lsof -i :7001
   
   # Kill processes using ports
   kill -9 $(lsof -t -i:3000)
   ```

### Performance Issues

1. **Slow Ingestion**: Reduce batch size in ingestion service
2. **High Memory Usage**: Monitor Docker container limits
3. **Database Locks**: Check for long-running queries
4. **Frontend Loading**: Enable compression and caching



## 🙏 Acknowledgments

- **NestJS**: Powerful Node.js framework
- **Next.js**: React framework for production
- **PostgreSQL**: Robust relational database
- **Docker**: Containerization platform
- **AWS**: Cloud infrastructure services
- **TypeScript**: Type-safe JavaScript development

---

**Built with ❤️ for Deal Bot Analytics** 