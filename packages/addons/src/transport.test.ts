import { afterEach, describe, expect, it } from 'vitest';
import { ambientFetch } from './transport.js';

/**
 * A model of the browser's rule, because Node does not have it.
 *
 * `fetch` in a browser is a method of `Window` and throws `TypeError: Illegal invocation` when
 * called with any other receiver. Node's `fetch` does not check, so `const f = globalThis.fetch;
 * f(url)` typechecks, passes every test here, and fails only in the browser — which is where this
 * package spends most of its life. That is exactly how it shipped once, and it was caught by
 * driving the real page rather than by anything in this file.
 *
 * So the check is modelled instead: the fake below refuses a wrong receiver the way a browser does,
 * and the test asserts `ambientFetch()` survives it.
 */
const realFetch = globalThis.fetch;

function installBrowserLikeFetch(): void {
  const impl = function (this: unknown, url: string): Promise<unknown> {
    if (this !== globalThis) {
      throw new TypeError("Failed to execute 'fetch' on 'Window': Illegal invocation");
    }
    return Promise.resolve({ url });
  };
  Object.defineProperty(globalThis, 'fetch', { value: impl, configurable: true, writable: true });
}

afterEach(() => {
  Object.defineProperty(globalThis, 'fetch', {
    value: realFetch,
    configurable: true,
    writable: true,
  });
});

describe('ambientFetch', () => {
  it('survives being called detached from the global object', async () => {
    installBrowserLikeFetch();
    const detached = ambientFetch();
    await expect(detached('https://api.example.org/x')).resolves.toBeDefined();
  });

  it('is what the naive version would have failed at', () => {
    installBrowserLikeFetch();
    const naive = globalThis.fetch;
    // The line this test exists to keep out of the codebase.
    expect(() => (naive as (url: string) => unknown)('https://api.example.org/x')).toThrow(
      /Illegal invocation/,
    );
  });

  it('says so plainly when the environment has no fetch at all', () => {
    Object.defineProperty(globalThis, 'fetch', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    expect(() => ambientFetch()).toThrow(/no fetch/);
  });
});
