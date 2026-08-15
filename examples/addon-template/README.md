# Addon template

A complete Golden Library addon in one dependency-free file, for copying.

```bash
node examples/addon-template/server.mjs
pnpm addon:validate http://localhost:4300/manifest.json
```

Then paste `http://localhost:4300/manifest.json` into the Addons page of a running instance.

The protocol it implements is specified in [docs/addon-protocol.md](../../docs/addon-protocol.md).
Where this file and that document disagree, the document is right.

## What this is not

It is **not a source**, and it is not shipped with the application. It serves two hard-coded public
domain books so that a reader of the code can see a whole request cycle; every one of the three
handlers is meant to be deleted and replaced.

Golden Library ships no addons and publishes no directory of them
([ADR-0010](../../docs/adr/0010-addon-engine.md) §5). An example that exists to be replaced is
documentation and is not an exception to that — the moment it pointed at a real catalogue and were
worth installing as it stands, it would be.

## If it appears to do nothing

Almost always CORS. A browser will make your request and then refuse to let the addon read the
answer unless the response carries `Access-Control-Allow-Origin`. `server.mjs` sets it on every
response, including the manifest; if you rewrite the transport, keep it.

## Writing a local addon instead

An addon that has to reach a server on the reader's own network — their Calibre-Web, say — cannot be
an HTTP addon, because your server cannot route to `192.168.1.10`. Write a local one instead:
a single JavaScript file calling `registerAddon`, published with a SHA-256 hash. The shape is in
[§4 of the protocol](../../docs/addon-protocol.md#4-local-addons).
