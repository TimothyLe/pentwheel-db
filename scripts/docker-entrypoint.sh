#!/bin/bash

# Exit on any error
set -e

echo "Starting Pentwheel API..."

# Function to wait for database
wait_for_db() {
    echo "Waiting for database connection..."
    
    # Extract database connection details from DATABASE_URL
    if [ -n "$DATABASE_URL" ]; then
        # Parse DATABASE_URL for host and port
        # Format: postgresql://user:password@host:port/database
        DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        
        if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
            echo "Checking database connection to $DB_HOST:$DB_PORT..."
            
            # Wait for database to be ready
            max_attempts=30
            attempt=1
            
            while [ $attempt -le $max_attempts ]; do
                if nc -z $DB_HOST $DB_PORT; then
                    echo "Database is ready!"
                    break
                fi
                
                echo "Database not ready yet (attempt $attempt/$max_attempts). Waiting 2 seconds..."
                sleep 2
                attempt=$((attempt + 1))
            done
            
            if [ $attempt -gt $max_attempts ]; then
                echo "Error: Database connection timeout after $max_attempts attempts"
                exit 1
            fi
        else
            echo "Warning: Could not parse DATABASE_URL for host and port"
        fi
    else
        echo "Warning: DATABASE_URL not set"
    fi
}

# Function to run database migrations (if you add Alembic later)
run_migrations() {
    echo "Running database migrations..."
    # Uncomment if using Alembic for migrations
    # alembic upgrade head
}

# Health check function
health_check() {
    echo "Running initial health check..."
    # Add any pre-startup health checks here
}

# Main startup process
main() {
    echo "Pentwheel API Docker Entrypoint"
    echo "==============================="
    
    # Wait for database if DATABASE_URL is provided
    if [ -n "$DATABASE_URL" ]; then
        wait_for_db
    fi
    
    # Run migrations (uncomment if needed)
    # run_migrations
    
    # Run health check
    health_check
    
    echo "Starting application..."
    echo "Command: $@"
    
    # Execute the main command
    exec "$@"
}

# Run main function with all arguments
main "$@"

