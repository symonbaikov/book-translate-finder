# ADR-0002: Idempotency via natural keys, upserts, and idempotency keys

- **Status:** accepted
- **Date:** 2026-08-12
- **Task context:** initial project planning

## Context

Data arrives from external sources via a queue (BullMQ, at-least-once delivery), on cron, and
through an internal HTTP endpoint. The same book arrives from several sources, in different
spellings and with varying field completeness. Reprocessing is inevitable: retries after a
timeout, worker restarts, cron overlapping with a manual run, a client repeating a request.
Without an explicit strategy this produces duplicate works and editions — and duplicates merged
after the fact are expensive and not always possible to recover.

## Decision

Idempotency is guaranteed at the DB schema level, not by carefulness in code:

1. **Natural key** — a deterministic hash of normalized content — on `work` and `edition`,
   plus uniqueness of `(source_name, external_id)` in `external_ref` and `url_hash` on `source_link`.
2. **Upsert only**: all writes from sources go through `INSERT ... ON CONFLICT DO UPDATE`.
3. **One transaction per logical operation** via `UnitOfWork` — a partially applied sync
   does not exist.
4. **Deterministic `jobId`** (`sync-{source}-{workId}-{date}`) — job deduplication on the queue side.
5. **`Idempotency-Key`** for mutating HTTP endpoints, storing the response and a request hash:
   a repeat with the same body returns the stored response; with a different one — `409`.
6. **`Clock` and `IdGenerator` as ports** — without them behavior is nondeterministic and
   idempotency cannot be verified in tests.

Every write operation is accompanied by a "double run yields the same state" test.

## Considered alternatives

| Option                                         | Pros                 | Cons                                                                    | Why not chosen                      |
| ---------------------------------------------- | -------------------- | ----------------------------------------------------------------------- | ----------------------------------- |
| "Does the record exist" check before insert    | Simple and obvious   | Race between concurrent workers; duplicates appear anyway               | No guarantee without a unique index |
| Rely on exactly-once from the queue            | No manual work       | No queue provides this guarantee in practice                            | False premise                       |
| After-the-fact deduplication by a separate job | Doesn't block writes | Data is temporarily wrong, merging loses information, hard to roll back | Cure instead of prevention          |

## Consequences

- Duplicates are impossible at the level of DB constraints, not developer intentions.
- The `normalize()` function becomes critical: changing it changes the natural keys, so edits
  are allowed only together with a key-recomputation migration.
- An `idempotency_key` table appears, along with a cleanup job for it (TTL 24 hours).
- Upsert queries are written by hand — one of the reasons for choosing Drizzle over Prisma.
