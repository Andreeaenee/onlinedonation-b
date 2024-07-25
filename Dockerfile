# Use the official Node.js 22.1.0 image as a base image
FROM node:22.1.0

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

RUN npm install

RUN npm rebuild bcrypt  

COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]