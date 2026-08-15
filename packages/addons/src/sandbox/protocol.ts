import { z } from 'zod';

/**
 * Everything that crosses the sandbox boundary, in both directions.
 *
 * Three participants, two hops:
 *
 * ```
 * host page  ──postMessage──▶  sandbox frame (opaque origin)  ──postMessage──▶  worker (addon code)
 * ```
 *
 * Two rules make this boundary worth having, and both are visible in the types below.
 *
 * **Only data crosses it.** Every message is plain JSON — no functions, no `MessagePort`, no
 * `Proxy`, nothing with an identity. Structured clone would refuse a function anyway; saying so in
 * the types means nobody tries and then works around the refusal.
 *
 * **Everything arriving from the sandbox is parsed, never cast.** The addon is a stranger's code and
 * the frame relays whatever it says. A `SandboxMessage` that has been through
 * `SandboxMessageSchema` is the only kind the host acts on; anything else is dropped and counted.
 * The host→sandbox direction needs no such schema — we wrote it.
 */

export const SANDBOX_PROTOCOL_VERSION = 1;

/** The three questions an addon answers, named as on `AddonTransport`. */
export const SandboxMethodSchema = z.enum(['getCatalog', 'getMeta', 'getSources']);
export type SandboxMethod = z.infer<typeof SandboxMethodSchema>;

/**
 * What an addon may ask the host to do for it. This list *is* the addon's power — there is no
 * ambient capability inside the worker, so anything not named here is not something an addon can
 * do (docs/adr/0010-addon-engine.md §3).
 */
export const CapabilitySchema = z.enum([
  /** An HTTP GET, to a host the manifest declared, performed by the host. */
  'fetchText',
  /** The same, parsed as JSON by the host so the addon does not ship a parser. */
  'fetchJson',
  /** XML → a plain object, likewise. OPDS is XML and every addon would otherwise bundle a parser. */
  'parseXml',
  /** Namespaced, quota-limited key/value that survives a reload. Never the reader's storage. */
  'storageGet',
  'storageSet',
  /** Goes to this addon's own log panel, not to the host console. */
  'log',
]);
export type Capability = z.infer<typeof CapabilitySchema>;

// ---------------------------------------------------------------------------------------------
// host → sandbox
// ---------------------------------------------------------------------------------------------

export type HostMessage =
  /** The only message that carries code. Sent once, immediately after the frame says `booted`. */
  | { readonly v: 1; readonly type: 'start'; readonly addonId: string; readonly source: string }
  | {
      readonly v: 1;
      readonly type: 'invoke';
      readonly callId: string;
      readonly method: SandboxMethod;
      readonly args: readonly unknown[];
    }
  | {
      readonly v: 1;
      readonly type: 'capabilityResult';
      readonly callId: string;
      readonly ok: true;
      readonly value: unknown;
    }
  | {
      readonly v: 1;
      readonly type: 'capabilityResult';
      readonly callId: string;
      readonly ok: false;
      readonly error: string;
    };

// ---------------------------------------------------------------------------------------------
// sandbox → host
// ---------------------------------------------------------------------------------------------

const BaseSchema = z.object({ v: z.literal(SANDBOX_PROTOCOL_VERSION) });

/** The frame is loaded and its worker plumbing is ready. Sent before any code exists. */
const BootedSchema = BaseSchema.extend({ type: z.literal('booted') });

/** The addon registered itself. `manifest` is unvalidated here and parsed by the caller. */
const ReadySchema = BaseSchema.extend({
  type: z.literal('ready'),
  manifest: z.unknown(),
});

const InvokeResultSchema = z.union([
  BaseSchema.extend({
    type: z.literal('invokeResult'),
    callId: z.string().min(1).max(64),
    ok: z.literal(true),
    value: z.unknown(),
  }),
  BaseSchema.extend({
    type: z.literal('invokeResult'),
    callId: z.string().min(1).max(64),
    ok: z.literal(false),
    error: z.string().max(2000),
  }),
]);

const CapabilityRequestSchema = BaseSchema.extend({
  type: z.literal('capability'),
  callId: z.string().min(1).max(64),
  name: CapabilitySchema,
  args: z.array(z.unknown()).max(8),
});

/** The addon threw where nothing could catch it, or the worker died. The addon is then done. */
const FatalSchema = BaseSchema.extend({
  type: z.literal('fatal'),
  error: z.string().max(2000),
});

export const SandboxMessageSchema = z.union([
  BootedSchema,
  ReadySchema,
  InvokeResultSchema,
  CapabilityRequestSchema,
  FatalSchema,
]);

export type SandboxMessage = z.infer<typeof SandboxMessageSchema>;

/** Parses a message off the wire, or `null` — a malformed one is dropped, never guessed at. */
export function readSandboxMessage(data: unknown): SandboxMessage | null {
  const result = SandboxMessageSchema.safeParse(data);
  return result.success ? result.data : null;
}
