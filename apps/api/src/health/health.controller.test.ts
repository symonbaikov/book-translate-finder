import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  const controller = new HealthController();

  it('reports live as ok', () => {
    expect(controller.live()).toEqual({ status: 'ok', service: '@btf/api', version: '0.0.0' });
  });

  it('reports ready as ok', () => {
    expect(controller.ready()).toEqual({ status: 'ok', service: '@btf/api', version: '0.0.0' });
  });
});
