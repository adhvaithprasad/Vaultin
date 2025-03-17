# Dockerfile
FROM node:latest

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend and frontend code
COPY . .


# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

