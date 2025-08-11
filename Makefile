.PHONY: build run stop clean logs shell test

# Build the Docker image
build:
	docker build -t pentwheel-api:latest .

# Run with Docker Compose
run:
	docker-compose up -d

# Stop all services
stop:
	docker-compose down

# Clean up containers and images
clean:
	docker-compose down -v
	docker system prune -f

# View logs
logs:
	docker-compose logs -f api

# Access container shell
shell:
	docker exec -it pentwheel_api bash

# Run tests in container
test:
	docker exec -it pentwheel_api python -m pytest

# Database shell
db-shell:
	docker exec -it pentwheel_postgres psql -U pentwheel_user -d pentwheel_db
