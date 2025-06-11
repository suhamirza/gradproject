# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the source code into the container
COPY . .

# Expose the port the app runs on (adjust if your app uses a different port)
EXPOSE 3001

# Define environment variable for production
ENV NODE_ENV=production

# Start the application
CMD [ "node", "index.js" ]
