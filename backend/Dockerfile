# Use the official Python base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required for FAISS and compiling C extensions
RUN apt-get update && apt-get install -y \
    build-essential \
    libomp-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user (Hugging Face Spaces requirement)
RUN useradd -m -u 1000 appuser

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
# We use --no-cache-dir to keep the image lightweight
RUN pip install --no-cache-dir -r requirements.txt

# Create the data directory so the backend can upload files
RUN mkdir -p /app/data && chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

# Set the HOME environment variable for Hugging Face Spaces compatibility
ENV HOME=/home/appuser \
    PATH=/home/appuser/.local/bin:$PATH

# Copy the rest of the application code into the container
# This includes the `app/` folder and any other `.py` scripts
COPY --chown=appuser:appuser . .

# Expose the default Hugging Face Spaces port
EXPOSE 7860

# Define the command to run the FastAPI application
# Hugging Face binds the API to 0.0.0.0 and defaults to port 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
