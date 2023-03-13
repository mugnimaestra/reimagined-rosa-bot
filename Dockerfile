# Use an official lightweight Node.js image
FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Set environment variables
ENV LINE_CHANNEL_SECRET=${LINE_CHANNEL_SECRET}
ENV LINE_ACCESS_TOKEN=${LINE_ACCESS_TOKEN}
ENV PORT=${PORT:-3000}

# Build TypeScript to JavaScript
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Expose port
EXPOSE $PORT

# Start the app
CMD ["npm", "start"]
