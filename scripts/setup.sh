#!/bin/bash

echo "🚀 Setting up Deal Bot Usage Analytics..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOF
# AWS Configuration
AWS_ACCESS_KEY_ID=AKIAUH2VA54VO5AZADOC
AWS_SECRET_ACCESS_KEY=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
AWS_REGION=us-east-1
S3_BUCKET_NAME=dev.deal-bot-logs

# Database Configuration (used by Docker Compose)
POSTGRES_DB=dealbot_analytics
POSTGRES_USER=analytics_user
POSTGRES_PASSWORD=analytics_pass
DATABASE_URL=postgresql://analytics_user:analytics_pass@db:5432/dealbot_analytics

# PgAdmin Configuration
PGADMIN_DEFAULT_EMAIL=admin@dealbot.com
PGADMIN_DEFAULT_PASSWORD=admin123

# Application Configuration
NODE_ENV=development
PORT=7000
API_PORT=7001

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:7001
EOF
    echo "✅ .env file created. Please update it with your AWS credentials."
else
    echo "✅ .env file already exists."
fi

# Make scripts executable
chmod +x scripts/*.sh

echo "🔧 Building Docker containers..."
docker-compose build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your AWS credentials"
echo "2. Run 'npm run dev' or 'docker-compose up --build' to start the application"
echo "3. Access the application at:"
echo "   - Frontend: http://localhost:5050"
echo "   - Backend API: http://localhost:7001"
echo "   - PgAdmin: http://localhost:8080" 