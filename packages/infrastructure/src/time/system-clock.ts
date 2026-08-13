import type { Clock } from '@btf/domain';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
