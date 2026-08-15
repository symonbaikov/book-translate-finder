import { describe, expect, it } from 'vitest';
import { readSandboxMessage, SANDBOX_PROTOCOL_VERSION } from './protocol.js';
import { WORKER_SHIM_SOURCE, composeWorkerSource } from './worker-shim.js';

const v = SANDBOX_PROTOCOL_VERSION;

describe('readSandboxMessage', () => {
  it.each([
    [{ v, type: 'booted' }],
    [{ v, type: 'ready', manifest: { id: 'x' } }],
    [{ v, type: 'invokeResult', callId: 'h1', ok: true, value: { metas: [] } }],
    [{ v, type: 'invokeResult', callId: 'h1', ok: false, error: 'nope' }],
    [{ v, type: 'capability', callId: 'c1', name: 'fetchText', args: ['https://x.example'] }],
    [{ v, type: 'fatal', error: 'crashed' }],
  ])('accepts %j', (message) => {
    expect(readSandboxMessage(message)).not.toBeNull();
  });

  /**
   * Everything arriving from the sandbox is a stranger's output relayed by a frame we do not trust
   * to filter it. Dropping the unreadable is the only safe reading — a partially-understood message
   * would be acted on with the parts we guessed.
   */
  it.each([
    [null],
    ['booted'],
    [{ type: 'booted' }],
    [{ v: 2, type: 'booted' }],
    [{ v, type: 'somethingElse' }],
    [{ v, type: 'capability', callId: 'c1', name: 'eval', args: [] }],
    [{ v, type: 'invokeResult', callId: '', ok: true, value: null }],
    [{ v, type: 'capability', callId: 'c1', name: 'fetchText', args: new Array(20).fill(0) }],
  ])('drops %j', (message) => {
    expect(readSandboxMessage(message)).toBeNull();
  });

  it('does not let an addon invent a capability by naming one', () => {
    expect(
      readSandboxMessage({ v, type: 'capability', callId: 'c1', name: 'importScripts', args: [] }),
    ).toBeNull();
  });
});

describe('composeWorkerSource', () => {
  it('puts the shim ahead of the addon, so no window exists without it', () => {
    const composed = composeWorkerSource('registerAddon({});');
    expect(composed.indexOf(WORKER_SHIM_SOURCE)).toBe(0);
    expect(composed.indexOf('registerAddon({});')).toBeGreaterThan(WORKER_SHIM_SOURCE.length);
  });

  it('removes the ambient network APIs before anything else runs', () => {
    // Belt to the CSP's braces: the addon sees a missing function and a clear TypeError rather
    // than a violation logged somewhere it will never look.
    for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'importScripts', 'indexedDB']) {
      expect(WORKER_SHIM_SOURCE).toContain(`'${name}'`);
    }
  });

  it('gives the addon exactly the documented surface and no more', () => {
    for (const member of ['fetchText', 'fetchJson', 'parseXml', 'storage', 'log']) {
      expect(WORKER_SHIM_SOURCE).toContain(member);
    }
    expect(WORKER_SHIM_SOURCE).not.toContain('eval(');
    expect(WORKER_SHIM_SOURCE).not.toContain('new Function');
  });
});
