import type { Clock } from '@golden/domain';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
