import type { Edition } from '../entities/edition.js';

export interface EditionRepository {
  findByNaturalKey(naturalKey: string): Promise<Edition | null>;
  findById(id: string): Promise<Edition | null>;
  findByWorkId(workId: string): Promise<Edition[]>;
  /** Upsert on `natural_key` (docs/rules.md §2.2) — never a bare insert. */
  save(edition: Edition): Promise<void>;
}
