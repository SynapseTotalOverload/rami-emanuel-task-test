FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json pnpm-lock.yaml* ./

RUN corepack enable && pnpm install --frozen-lockfile --prod

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]
