import { beforeEach, describe, expect, it } from 'vitest';
import { assertLinkAllowed } from '../../src/policy/link-policy.js';
import type { SourceLinkRepository } from '../../src/ports/source-link-repository.port.js';
import { ProviderId } from '../../src/value-objects/provider-id.js';

export interface SourceLinkRepositoryContractOptions {
  /**
   * Every link in this suite references `editionId: 'edition-1'`. The in-memory fake doesn't
   * enforce referential integrity, but a real database's `source_link.edition_id` foreign key
   * (docs/architecture.md §3.1) does — so a Postgres-backed run needs a real `edition` row (and
   * transitively a `work` row) to exist first. No-op by default.
   */
  ensureEditionExists?: (editionId: string) => Promise<void>;
}

export function runSourceLinkRepositoryContractTests(
  createRepository: () => SourceLinkRepository,
  options: SourceLinkRepositoryContractOptions = {},
): void {
  const makeLink = (overrides: Partial<Parameters<typeof assertLinkAllowed>[0]> = {}) =>
    assertLinkAllowed({
      id: 'link-1',
      editionId: 'edition-1',
      type: 'download',
      url: 'https://www.gutenberg.org/ebooks/1342',
      provider: ProviderId.create('gutenberg'),
      rightsStatus: 'public_domain',
      verifiedAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    });

  describe('SourceLinkRepository contract', () => {
    beforeEach(async () => {
      await options.ensureEditionExists?.('edition-1');
    });

    it('returns an empty array for an edition with no links', async () => {
      const repo = createRepository();
      expect(await repo.findByEditionId('missing')).toEqual([]);
    });

    it('save() then findByEditionId() returns the saved link', async () => {
      const repo = createRepository();
      await repo.save(makeLink());
      expect(await repo.findByEditionId('edition-1')).toHaveLength(1);
    });

    it('re-saving the same (edition, provider, type, url) upserts, not duplicates', async () => {
      const repo = createRepository();
      await repo.save(makeLink({ id: 'link-1' }));
      await repo.save(makeLink({ id: 'link-2' }));

      const links = await repo.findByEditionId('edition-1');
      expect(links).toHaveLength(1);
      expect(links[0]!.id).toBe('link-1');
    });

    it('re-verifying a link with a different rights status updates the stored one, keeping its id', async () => {
      const repo = createRepository();
      await repo.save(makeLink({ id: 'link-1', verifiedAt: new Date('2026-01-01T00:00:00Z') }));
      const later = new Date('2026-06-01T00:00:00Z');
      await repo.save(makeLink({ id: 'link-2', verifiedAt: later }));

      const links = await repo.findByEditionId('edition-1');
      expect(links).toHaveLength(1);
      expect(links[0]!.id).toBe('link-1');
      expect(links[0]!.verifiedAt).toEqual(later);
    });

    it('the same edition can have distinct links for different providers or link types', async () => {
      const repo = createRepository();
      await repo.save(makeLink({ id: 'link-1' }));
      await repo.save(
        makeLink({
          id: 'link-2',
          type: 'buy',
          provider: ProviderId.create('amazon'),
          url: 'https://amazon.com/dp/xyz',
          rightsStatus: 'copyrighted',
        }),
      );

      expect(await repo.findByEditionId('edition-1')).toHaveLength(2);
    });
  });
}
