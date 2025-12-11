# Use Python 3.11 Slim
FROM python:3.11-slim

# Set working directory to /app
WORKDIR /app

# Install system dependencies (needed for psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from the backend directory
# Note: We assume the build context is the project root
COPY backend/requirements.txt ./backend/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the backend source code
COPY backend/ ./backend/

# Expose the port
EXPOSE 8001

# Run the application
# We run from /app so that "backend.main" is a valid module path
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8001"]
