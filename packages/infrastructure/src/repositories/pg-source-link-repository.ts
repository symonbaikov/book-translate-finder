import { count, eq, inArray } from 'drizzle-orm';
import {
  isLinkType,
  isRightsStatus,
  ProviderId,
  SourceLink,
  type SourceLinkRepository,
} from '@btf/domain';
import type { Db } from '../db/client.js';
import { resolveDb } from '../db/transaction-context.js';
import { sourceLink } from '../db/schema.js';

function toDomain(row: typeof sourceLink.$inferSelect): SourceLink {
  if (!isLinkType(row.type)) throw new Error(`Corrupt source_link row: unknown type ${row.type}`);
  if (!isRightsStatus(row.rightsStatus)) {
    throw new Error(`Corrupt source_link row: unknown rights_status ${row.rightsStatus}`);
  }
  return SourceLink.rehydrateFromStorage({
    id: row.id,
    editionId: row.editionId,
    type: row.type,
    url: row.url,
    urlHash: row.urlHash,
    provider: ProviderId.create(row.provider),
    rightsStatus: row.rightsStatus,
    isLegalFree: row.isLegalFree,
    verifiedAt: row.verifiedAt,
  });
}

export class PgSourceLinkRepository implements SourceLinkRepository {
  constructor(private readonly db: Db) {}

  /** Resolves to the ambient transaction if PgUnitOfWork.runInTransaction is active, else the pool. */
  private get q() {
    return resolveDb(this.db);
  }

  async findByEditionId(editionId: string): Promise<SourceLink[]> {
    const rows = await this.q.select().from(sourceLink).where(eq(sourceLink.editionId, editionId));
    return rows.map(toDomain);
  }

  async countByEditionIds(editionIds: readonly string[]): Promise<Map<string, number>> {
    if (editionIds.length === 0) return new Map();
    const rows = await this.q
      .select({ editionId: sourceLink.editionId, links: count() })
      .from(sourceLink)
      .where(inArray(sourceLink.editionId, [...editionIds]))
      .groupBy(sourceLink.editionId);
    return new Map(rows.map((row) => [row.editionId, Number(row.links)]));
  }

  async save(link: SourceLink): Promise<void> {
    await this.q
      .insert(sourceLink)
      .values({
        id: link.id,
        editionId: link.editionId,
        type: link.type,
        url: link.url,
        urlHash: link.urlHash,
        provider: link.provider.value,
        rightsStatus: link.rightsStatus,
        isLegalFree: link.isLegalFree,
        verifiedAt: link.verifiedAt,
      })
      .onConflictDoUpdate({
        target: [sourceLink.editionId, sourceLink.provider, sourceLink.type, sourceLink.urlHash],
        set: {
          // `id` deliberately excluded — same upsert contract as PgWorkRepository. Only the
          // fields that can legitimately change on re-verification are refreshed.
          rightsStatus: link.rightsStatus,
          isLegalFree: link.isLegalFree,
          verifiedAt: link.verifiedAt,
        },
      });
  }
}
