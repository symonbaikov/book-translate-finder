# syntax=docker/dockerfile:1.7
#
# Shared multi-stage build for apps/api and apps/worker — same pnpm-workspace build pipeline,
# only the deployed package differs. Select it with:
#   docker build -f docker/app.Dockerfile --build-arg APP_NAME=api    -t btf-api    .
#   docker build -f docker/app.Dockerfile --build-arg APP_NAME=worker -t btf-worker .
#
# `pnpm deploy` (build stage) resolves workspace:* dependencies and copies (not symlinks) only
# the selected app plus its production dependencies into an isolated directory — exactly what
# the runtime stage needs, nothing else (docs/architecture.md §9.1).

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
ARG APP_NAME
COPY pnpm-workspace.yaml pnpm-lock.yaml .npmrc package.json ./
COPY packages/domain/package.json packages/domain/package.json
COPY packages/application/package.json packages/application/package.json
COPY packages/infrastructure/package.json packages/infrastructure/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS build
ARG APP_NAME
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY apps/worker ./apps/worker
RUN pnpm --filter "@btf/${APP_NAME}..." run build
RUN pnpm --filter "@btf/${APP_NAME}" deploy --prod "/repo/deploy/${APP_NAME}"

FROM node:20-alpine AS runtime
ARG APP_NAME
RUN addgroup -S btf && adduser -S btf -G btf
WORKDIR /app
COPY --from=build --chown=btf:btf "/repo/deploy/${APP_NAME}" ./
USER btf
ENV NODE_ENV=production
# APP_NAME is baked in at build time via the deploy path above, not needed at runtime.
CMD ["node", "dist/main.js"]
