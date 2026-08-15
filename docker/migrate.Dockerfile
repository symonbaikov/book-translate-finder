# syntax=docker/dockerfile:1.7
#
# One-shot migration service (docs/architecture.md §9.1) — a dedicated image, not a step in
# api's or worker's entrypoint. Running migrations from multiple replicas' entrypoints at once is
# a race; a single one-shot `migrate` compose service with `depends_on: service_completed_successfully`
# on api/worker removes the question entirely.
#
#   docker build -f docker/migrate.Dockerfile -t btf-migrate .

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml .npmrc package.json ./
COPY packages/domain/package.json packages/domain/package.json
COPY packages/application/package.json packages/application/package.json
COPY packages/infrastructure/package.json packages/infrastructure/package.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/domain ./packages/domain
COPY packages/application ./packages/application
COPY packages/infrastructure ./packages/infrastructure
RUN pnpm --filter @golden/infrastructure... run build
RUN pnpm --filter @golden/infrastructure deploy --prod /repo/deploy/migrate

FROM node:20-alpine AS runtime
RUN addgroup -S btf && adduser -S btf -G btf
WORKDIR /app
COPY --from=build --chown=btf:btf /repo/deploy/migrate ./
# Copy the backfill script and dependencies
COPY --chown=btf:btf scripts ./scripts
COPY --chown=btf:btf packages/infrastructure/src/db/schema.ts ./packages/infrastructure/src/db/schema.ts
COPY --chown=btf:btf pnpm-lock.yaml .npmrc package.json pnpm-workspace.yaml ./
USER btf
ENV NODE_ENV=production
# Seeding the language table is idempotent (ON CONFLICT DO UPDATE, docs/plan.md §1.2 findings) —
# safe to run every time the migrate service runs, not just on first install.
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/db/seed.js"]
