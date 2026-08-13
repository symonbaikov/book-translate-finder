import type { IdGenerator } from '../../src/ports/id-generator.port.js';

/** Deterministic `IdGenerator` for tests — hands out "id-1", "id-2", ... in order. */
export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;

  newId(): string {
    this.counter += 1;
    return `id-${this.counter}`;
  }
}
