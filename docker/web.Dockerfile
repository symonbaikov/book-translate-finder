# syntax=docker/dockerfile:1.7
#
# apps/web's Next.js build differs enough from api/worker's plain-tsc build (standalone output
# tracing, static assets, a `server.js` entrypoint) to warrant its own Dockerfile rather than
# forcing it through docker/app.Dockerfile's `pnpm deploy` pattern.
#
#   docker build -f docker/web.Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
#     -t btf-web .
#
# NEXT_PUBLIC_API_URL is inlined into the client JS bundle at build time (Next.js convention for
# NEXT_PUBLIC_* vars) — it cannot be changed at container runtime the way DATABASE_URL can for
# api/worker. Rebuild the image to point a self-host instance at a different API URL.

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml .npmrc package.json ./
COPY packages/contracts/package.json packages/contracts/package.json
COPY apps/web/package.json apps/web/package.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY tsconfig.base.json ./
COPY packages/contracts ./packages/contracts
COPY apps/web ./apps/web
RUN pnpm --filter @golden/contracts run build
RUN pnpm --filter @golden/web run build

FROM node:20-alpine AS runtime
RUN addgroup -S btf && adduser -S btf -G btf
WORKDIR /app
COPY --from=build --chown=btf:btf /repo/apps/web/.next/standalone ./
COPY --from=build --chown=btf:btf /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=btf:btf /repo/apps/web/public ./apps/web/public
USER btf
ENV NODE_ENV=production
ENV PORT=3000
# Docker sets HOSTNAME to the container id by default, and Next's standalone server.js binds to
# whatever HOSTNAME resolves to — found live: without this override it bound only to the
# container's own bridge IP, refusing connections on 127.0.0.1/localhost (including from the
# healthcheck below, which runs *inside* the container). 0.0.0.0 makes it listen on all interfaces.
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
