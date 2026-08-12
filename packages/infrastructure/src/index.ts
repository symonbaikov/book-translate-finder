// Phase 1.0 skeleton: config loading and logging only — the two things apps/api and
// apps/worker both need to boot. Repository adapters, HTTP source clients and BullMQ wiring
// land in Phase 1.2-1.3 (docs/plan.md).
export { baseEnvSchema, loadEnv, type BaseEnv } from './config/base-env.schema.js';
export {
  createLogger,
  withCorrelationId,
  type CreateLoggerOptions,
} from './logging/create-logger.js';
