FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and lockfile to the container
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copy the rest of the application files
COPY . .

# Build the TypeScript app
RUN npm run build

# Start a new, smaller stage for production deployment
FROM build AS production

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/package.json ./
COPY --from=build /app/yarn.lock* /app/package-lock.json* /app/pnpm-lock.yaml* ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/sql ./sql
COPY --from=build /app/.env ./

# Install only production dependencies
RUN \
  if [ -f yarn.lock ]; then yarn install --production --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --omit=dev; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --prod --frozen-lockfile; \
  fi

# Set the environment variable
ENV NODE_ENV=production

# Expose the port that the app runs only
EXPOSE 8000

# Start the application
CMD [ "node", "dist/src/index.js" ]