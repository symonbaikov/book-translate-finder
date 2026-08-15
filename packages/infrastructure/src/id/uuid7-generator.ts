import type { IdGenerator } from '@golden/domain';
import { v7 as uuidv7 } from 'uuid';

/** Time-sortable without exposing a raw sequence (docs/architecture.md §8). */
export class Uuid7Generator implements IdGenerator {
  newId(): string {
    return uuidv7();
  }
}
