import type { Clock } from '../../src/ports/clock.port.js';

/** Deterministic `Clock` for tests — never advances unless `set()` is called explicitly. */
export class FixedClock implements Clock {
  constructor(private current: Date) {}

  now(): Date {
    return this.current;
  }

  set(date: Date): void {
    this.current = date;
  }
}
