# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy only package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Stage 2: Create the final image
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy node_modules and the rest of the application from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

# Use a non-root user (node is the default user in the node:18-alpine image)
USER node

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["npm", "run", "dev"]
