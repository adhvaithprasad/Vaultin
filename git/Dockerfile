FROM node:18-slim

# Install Git manually
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN git --version
# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose API port
EXPOSE 8000

# Start the server
CMD ["node", "index.js"]