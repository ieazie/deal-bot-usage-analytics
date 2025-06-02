-- Database initialization script for Deal Bot Analytics
-- This script runs when the PostgreSQL container starts for the first time

-- Ensure the database exists (Docker already creates it from POSTGRES_DB)
-- CREATE DATABASE IF NOT EXISTS dealbot_analytics;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create a basic health check view
CREATE OR REPLACE VIEW db_health AS
SELECT 
    'PostgreSQL' as service,
    version() as version,
    current_timestamp as timestamp,
    'healthy' as status; 