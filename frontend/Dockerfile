FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ARG NEXT_PUBLIC_DEMO_EMPLOYEE_ID=emp_001
ARG NEXT_PUBLIC_DEMO_MANAGER_ID=mgr_001
ARG NEXT_PUBLIC_USE_MOCK=false

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_DEMO_EMPLOYEE_ID=$NEXT_PUBLIC_DEMO_EMPLOYEE_ID
ENV NEXT_PUBLIC_DEMO_MANAGER_ID=$NEXT_PUBLIC_DEMO_MANAGER_ID
ENV NEXT_PUBLIC_USE_MOCK=$NEXT_PUBLIC_USE_MOCK

RUN npm run build

# ---

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
