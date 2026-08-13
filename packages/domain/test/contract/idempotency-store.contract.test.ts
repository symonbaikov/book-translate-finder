import { InMemoryIdempotencyStore } from '../fakes/in-memory-idempotency-store.js';
import { runIdempotencyStoreContractTests } from './idempotency-store.contract-suite.js';

runIdempotencyStoreContractTests(() => new InMemoryIdempotencyStore());
