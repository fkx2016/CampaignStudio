# Use a lightweight Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package definition
COPY package.json ./
# COPY package-lock.json ./ 

# Install dependencies
# Note: In a real build, we would run 'npm install'
# For this prototype, we assume node_modules might be mounted or installed later
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Start the application
CMD ["npm", "start"]
