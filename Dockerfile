# Use Python 3.11 slim image as base
# Slim images are smaller and more secure than full images
FROM python:3.11-slim

# Set metadata labels for better container management
LABEL maintainer="your-email@example.com"
LABEL description="Pentwheel FastAPI"
LABEL version="1.0.0"

# Set environment variables
# PYTHONDONTWRITEBYTECODE: Prevents Python from writing pyc files to disc
# PYTHONUNBUFFERED: Prevents Python from buffering stdout and stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000

# Install system dependencies
# apt-get update: Update package list
# apt-get install -y --no-install-recommends: Install only essential packages
# gcc: Required for compiling some Python packages
# libpq-dev: PostgreSQL development libraries for psycopg2
# rm -rf /var/lib/apt/lists/*: Clean up apt cache to reduce image size
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        curl \
        netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
# Running as root in containers is a security risk
RUN useradd --create-home --shell /bin/bash pentwheel

# Set working directory
WORKDIR /app

# Copy requirements first for better Docker layer caching
# This allows Docker to cache the pip install step if requirements don't change
COPY requirements.txt .

# Install Python dependencies
# --no-cache-dir: Don't cache downloaded packages to reduce image size
# --upgrade: Upgrade pip to latest version
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
# Copy everything except what's in .dockerignore
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p /app/logs \
    && chown -R pentwheel:pentwheel /app

# Copy and make startup script executable
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Switch to non-root user
USER pentwheel

# Expose the port the app runs on
EXPOSE $PORT

# Health check to ensure container is working
# This allows Docker/K8s to know if the container is healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Use entrypoint script for startup
ENTRYPOINT ["/docker-entrypoint.sh"]

# Default command (can be overridden)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
