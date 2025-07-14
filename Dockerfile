FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies using npm
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# Use npm instead of pnpm in CMD for consistency
CMD ["npm", "run", "start:dev"]
