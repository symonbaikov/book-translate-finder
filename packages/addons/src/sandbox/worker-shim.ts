/**
 * The code that runs inside the worker, ahead of the addon's own.
 *
 * It is a string rather than a module because of where it has to end up: the addon bundle and this
 * shim are concatenated, turned into a `Blob`, and handed to `new Worker()` inside a document on an
 * opaque origin. There is no import graph there to hang a module off.
 *
 * Written in ES5-flavoured JavaScript on purpose — no template literals, no arrow functions, no
 * optional chaining. Not for old browsers, but because this string is concatenated with a stranger's
 * code and then read by whoever is auditing the sandbox; the fewer constructs in it, the fewer
 * places for something to hide.
 *
 * Three things happen here, in order, before the addon gets to run:
 *
 * 1. The ambient capabilities are removed. `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`,
 *    `importScripts`, `indexedDB` and `caches` are all blocked by the frame's CSP already
 *    (`connect-src 'none'`, `script-src` without `'self'`), but a blocked call fails as a violation
 *    somewhere in the console, while a missing function fails as a `TypeError` in the addon's own
 *    error handler where its author will actually see it. Belt and braces, and a better message.
 * 2. `golden` is installed — the whole of what an addon can do, and every entry of it a message to
 *    the host rather than a capability of its own.
 * 3. `registerAddon` is installed, which the bundle is expected to call at top level.
 */
export const WORKER_SHIM_SOURCE = `(function () {
  'use strict';

  var AMBIENT = [
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'EventSource',
    'importScripts',
    'indexedDB',
    'caches',
    'Notification',
    'BroadcastChannel'
  ];
  for (var i = 0; i < AMBIENT.length; i += 1) {
    try {
      Object.defineProperty(self, AMBIENT[i], {
        value: undefined,
        configurable: true,
        writable: false
      });
    } catch (ignored) {
      // A non-configurable global cannot be shadowed. The CSP is still in front of it, which is
      // why this is the second line of defence and not the first.
    }
  }

  var pending = {};
  var sequence = 0;
  var addon = null;

  function post(message) {
    try {
      self.postMessage(message);
    } catch (error) {
      // Structured clone refused it — an addon returned a function, a DOM node, or something
      // circular. Say so rather than dying silently.
      self.postMessage({
        v: 1,
        type: 'fatal',
        error: 'This addon returned a value that cannot cross the sandbox boundary.'
      });
    }
  }

  function ask(name, args) {
    sequence += 1;
    var callId = 'c' + sequence;
    return new Promise(function (resolve, reject) {
      pending[callId] = { resolve: resolve, reject: reject };
      post({ v: 1, type: 'capability', callId: callId, name: name, args: args });
    });
  }

  self.golden = {
    fetchText: function (url, init) {
      return ask('fetchText', [String(url), init || null]);
    },
    fetchJson: function (url, init) {
      return ask('fetchJson', [String(url), init || null]);
    },
    parseXml: function (text) {
      return ask('parseXml', [String(text)]);
    },
    storage: {
      get: function (key) {
        return ask('storageGet', [String(key)]);
      },
      set: function (key, value) {
        return ask('storageSet', [String(key), value]);
      }
    },
    log: function (message) {
      return ask('log', ['info', String(message)]);
    }
  };

  self.registerAddon = function (definition) {
    addon = definition;
    post({ v: 1, type: 'ready', manifest: definition ? definition.manifest : null });
  };

  self.onmessage = function (event) {
    var message = event.data;
    if (!message || message.v !== 1) return;

    if (message.type === 'capabilityResult') {
      var waiting = pending[message.callId];
      if (!waiting) return;
      delete pending[message.callId];
      if (message.ok) waiting.resolve(message.value);
      else waiting.reject(new Error(message.error));
      return;
    }

    if (message.type === 'invoke') {
      var method = addon ? addon[message.method] : null;
      if (typeof method !== 'function') {
        post({
          v: 1,
          type: 'invokeResult',
          callId: message.callId,
          ok: false,
          error: 'This addon does not implement ' + message.method + '.'
        });
        return;
      }
      Promise.resolve()
        .then(function () {
          return method.apply(addon, message.args || []);
        })
        .then(function (value) {
          post({ v: 1, type: 'invokeResult', callId: message.callId, ok: true, value: value });
        })
        .catch(function (error) {
          post({
            v: 1,
            type: 'invokeResult',
            callId: message.callId,
            ok: false,
            error: error && error.message ? String(error.message) : String(error)
          });
        });
    }
  };

  self.onerror = function (event) {
    post({
      v: 1,
      type: 'fatal',
      error: event && event.message ? String(event.message) : 'The addon stopped with an error.'
    });
    return true;
  };
})();
`;

/**
 * The complete worker script for one addon: our shim, then their code.
 *
 * The order is the point — every removal and every definition above is already in effect by the
 * time the bundle's first statement runs, so there is no window in which an addon sees an ambient
 * `fetch`.
 */
export function composeWorkerSource(addonSource: string): string {
  return `${WORKER_SHIM_SOURCE}\n;(function(){\n${addonSource}\n})();\n`;
}
