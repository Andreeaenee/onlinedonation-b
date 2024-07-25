# Use the official Node.js 22.5.1 image as a base image
FROM node:22.5.1

# Set the working directory
WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Rebuild native modules to ensure compatibility
RUN npm rebuild bcrypt

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
