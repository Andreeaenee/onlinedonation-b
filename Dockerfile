# Use the official Node.js image from the Docker Hub
FROM node:22-alpine

# Create and change to the app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Rebuild bcrypt to match the Docker environment
RUN npm rebuild bcrypt

# Copy the rest of your application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
