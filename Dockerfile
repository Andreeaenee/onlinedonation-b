# Use the official Node.js 22.1.0 image as a base image
FROM node:22.1.0

# Set the working directory
WORKDIR /app

COPY . .   

RUN npm install

RUN npm rebuild bcrypt  

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]