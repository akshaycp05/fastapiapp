# 1. Use the official lightweight Python image
FROM python:3.11-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the list of Python dependencies
COPY requirements.txt .

# 4. Install the dependencies (no-cache-dir keeps the image size small)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of our application code into the container
COPY . .

# 6. Document that the container listens on port 8000
EXPOSE 8000

# 7. Start the FastAPI application using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]