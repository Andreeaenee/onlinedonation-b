# Use the official Node.js 22.1.0 image as a base image
FROM node:22.1.0

# Set the working directory
WORKDIR /app

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
