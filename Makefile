# Deal Bot Usage Analytics - Makefile
# Common development tasks wrapped in make commands

.PHONY: help setup dev build start stop reset logs test clean install

# Default target
help:
	@echo "Deal Bot Usage Analytics - Available Commands:"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make setup          - Initial project setup"
	@echo "  make install        - Install all dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start development environment"
	@echo "  make dev-backend    - Start backend only"
	@echo "  make dev-frontend   - Start frontend only"
	@echo ""
	@echo "Docker Management:"
	@echo "  make build          - Build Docker containers"
	@echo "  make start          - Start all services"
	@echo "  make stop           - Stop all services"
	@echo "  make reset          - Reset and rebuild everything"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate     - Run database migrations"
	@echo "  make db-reset       - Reset database"
	@echo "  make db-logs        - View database logs"
	@echo ""
	@echo "Data Ingestion:"
	@echo "  make ingest         - Run data ingestion"
	@echo ""
	@echo "Testing:"
	@echo "  make test           - Run all tests"
	@echo "  make test-backend   - Run backend tests"
	@echo "  make test-frontend  - Run frontend tests"
	@echo ""
	@echo "Logs & Monitoring:"
	@echo "  make logs           - View all service logs"
	@echo "  make logs-backend   - View backend logs"
	@echo "  make logs-frontend  - View frontend logs"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          - Clean up containers and volumes"
	@echo ""
	@echo "Access URLs:"
	@echo "  Frontend:    http://localhost:5050"
	@echo "  Backend API: http://localhost:7001"
	@echo "  PgAdmin:     http://localhost:8080"

# Setup & Installation
setup:
	@echo "🚀 Setting up Deal Bot Usage Analytics..."
	@./scripts/setup.sh

install:
	@echo "📦 Installing dependencies..."
	@cd backend && npm install
	@cd frontend && npm install

# Development
dev:
	@echo "🔧 Starting development environment..."
	@docker-compose up --build

dev-backend:
	@echo "🔧 Starting backend development..."
	@cd backend && npm run start:dev

dev-frontend:
	@echo "🔧 Starting frontend development..."
	@cd frontend && npm run dev

# Docker Management
build:
	@echo "🏗️ Building Docker containers..."
	@docker-compose build

start:
	@echo "▶️ Starting all services..."
	@docker-compose up

stop:
	@echo "⏹️ Stopping all services..."
	@docker-compose down

reset:
	@echo "🔄 Resetting and rebuilding everything..."
	@docker-compose down -v
	@docker-compose up --build

# Database
db-migrate:
	@echo "🗃️ Running database migrations..."
	@cd backend && npm run migration:run

db-reset:
	@echo "🗃️ Resetting database..."
	@docker-compose down -v db
	@docker-compose up -d db

db-logs:
	@echo "📋 Viewing database logs..."
	@docker-compose logs -f db

# Data Ingestion
ingest:
	@echo "📥 Running data ingestion..."
	@docker-compose exec backend npm run ingest

# Testing
test:
	@echo "🧪 Running all tests..."
	@./scripts/test.sh

test-backend:
	@echo "🧪 Running backend tests..."
	@cd backend && npm test

test-frontend:
	@echo "🧪 Running frontend tests..."
	@cd frontend && npm test

# Logs & Monitoring
logs:
	@echo "📋 Viewing all service logs..."
	@docker-compose logs -f

logs-backend:
	@echo "📋 Viewing backend logs..."
	@docker-compose logs -f backend

logs-frontend:
	@echo "📋 Viewing frontend logs..."
	@docker-compose logs -f frontend

# Cleanup
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	@docker-compose down -v
	@docker system prune -f 