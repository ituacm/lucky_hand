FROM node:alpine

WORKDIR /app

# Copy package.json ve package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]