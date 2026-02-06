# Use the official Python 3.13 runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose port 8000
EXPOSE 8000

# Change the command to use absolute imports via uvicorn
# You will likely need to adjust the command to match your project's top-level module name
# E.g., If main.py is at the root, you might run it differently or reorganize slightly.

# Assuming main.py is in the root of your WORKDIR (/app)
CMD ["uvicorn", "main:app", "--workers", "4", "--host", "0.0.0.0", "--port", "10000"]
