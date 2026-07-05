FROM python:3.11-slim

# Avoid writing .pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU-only first to save space, then sentence-transformers
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir sentence-transformers

# Install remaining backend requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY api/ ./api
COPY run_backend.py .

EXPOSE 8000

# Ensure the root folder is on the PYTHONPATH
ENV PYTHONPATH=/app

CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "8000"]
