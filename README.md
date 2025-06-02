# Deal Bot Usage Analytics

A TypeScript-based analytics platform for Deal Bot usage monitoring, consisting of data ingestion from S3, storage in PostgreSQL, and a web interface for non-technical users to analyze conversation logs and usage metrics.

## Project Overview

This project implements a comprehensive analytics solution with:
- **Backend**: NestJS with TypeORM and PostgreSQL
- **Frontend**: Next.js with Tailwind CSS
- **Data Ingestion**: S3 log processing and batch ingestion
- **Analytics**: Metrics dashboard and conversation search
- **Infrastructure**: Docker Compose with automated migrations

## Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd deal-bot-usage-analytics
   cp .env.example .env
   # Edit .env with your AWS credentials
   ```

2. **Start the Application**
   ```bash
   docker-compose up --build
   ```

3. **Access the Application**
   - **Frontend**: http://localhost:5050
   - **Backend API**: http://localhost:7001
   - **PgAdmin**: http://localhost:8080 (admin@dealbot.com / admin123)

## Architecture

### Tech Stack
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Frontend**: Next.js 14, Tailwind CSS, React Query
- **Infrastructure**: Docker, PostgreSQL, PgAdmin
- **AWS**: S3 SDK for log ingestion

### Key Features
- Automated S3 log ingestion
- Real-time analytics dashboard
- Conversation search and filtering
- Automatic database migrations
- Health checks and monitoring

## Environment Variables

### Required Variables
```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket_name

# Database Configuration (auto-configured in Docker)
DATABASE_URL=postgresql://analytics_user:analytics_pass@localhost:5432/dealbot_analytics
```

## Development Commands

### Docker Commands
```bash
# Start all services
docker-compose up --build

# Start individual services
docker-compose up db pgadmin
docker-compose up backend
docker-compose up frontend

# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Reset database (caution: deletes all data)
docker-compose down -v
docker-compose up --build
```

### Backend Commands
```bash
cd backend

# Development
npm run start:dev

# Run migrations
npm run migration:run

# Generate migration
npm run migration:generate -- -n MigrationName

# Run tests
npm run test
npm run test:e2e
```

### Frontend Commands
```bash
cd frontend

# Development
npm run dev

# Build
npm run build

# Test
npm run test
```

### Data Ingestion
```bash
# Run ingestion (in Docker)
docker-compose exec backend npm run ingest

# Run ingestion (local)
cd backend && npm run ingest
```

## Database Access

### PgAdmin
- URL: http://localhost:8080
- Email: admin@dealbot.com
- Password: admin123

### Direct Database Connection
- Host: localhost
- Port: 5432
- Database: dealbot_analytics
- Username: analytics_user
- Password: analytics_pass

## Project Structure

```
deal-bot-usage-analytics/
├── backend/          # NestJS API application
├── frontend/         # Next.js web application
├── database/         # Database initialization scripts
├── scripts/          # Utility scripts
├── docs/            # Additional documentation
└── docker-compose.yml # Container orchestration
```

## Testing

### Backend Tests
- **Unit Tests**: Service logic and business rules
- **Integration Tests**: Database and API endpoints
- **E2E Tests**: Complete workflow testing

### Frontend Tests
- **Component Tests**: React component testing
- **Page Tests**: Next.js page testing
- **Hook Tests**: Custom hook testing

## Deployment

The application is containerized and can be deployed using:
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Contributing

1. Follow the established project structure
2. Add tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## License

[Your License Here] 