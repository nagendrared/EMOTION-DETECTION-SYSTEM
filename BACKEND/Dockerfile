# Use specific Python version
FROM python:3.11.4-slim

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port (Render uses $PORT)
EXPOSE 5000

# Command to run Flask app
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
