FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

COPY --from=builder --chown=node:node /app/dist/standalone ./
# Vinext 1.0 beta does not copy its React peer dependencies into the
# standalone bundle. Keep them explicit so the container is truly isolated.
COPY --from=builder --chown=node:node /app/node_modules/react ./node_modules/react
COPY --from=builder --chown=node:node /app/node_modules/react-dom ./node_modules/react-dom
COPY --from=builder --chown=node:node /app/node_modules/scheduler ./node_modules/scheduler

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/robots.txt').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
