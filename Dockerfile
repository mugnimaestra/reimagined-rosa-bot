# Dockerfile for Node.js app

# specify the base image
FROM node:14-alpine

# set the working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# install dependencies
RUN npm install --production

# copy the rest of the app files
COPY . .

# set the command to run the app
CMD ["npm", "start"]
