# Use specific Python version
FROM python:3.11.4-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements.txt from BACKEND folder
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files
COPY . .

# Expose port (Render uses $PORT)
EXPOSE 5000

# Command to run Flask app with gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
