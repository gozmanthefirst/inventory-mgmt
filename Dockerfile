FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and lockfile to the container
COPY pnpm-lock.yaml package.json ./

# Copy the Prisma directory to allow for `pnpm dlx prisma generate`
COPY prisma ./prisma

# Install dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile && \
    pnpm dlx prisma generate

# Copy the rest of the application files
COPY . .

# Build the TypeScript app
RUN pnpm build

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
RUN npm install -g pnpm && \
    pnpm install --prod --frozen-lockfile

# Set the environment variable
ENV NODE_ENV=production

# Expose the port that the app runs only
EXPOSE 8001

# Start the application
CMD [ "node", "dist/src/index.js" ]