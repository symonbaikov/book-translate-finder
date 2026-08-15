import {
  assertHttpUrlTemplate,
  InvalidUrlTemplateError,
  type SourceProviderConfig,
} from '@golden/plugins';

/**
 * The reader's own custom sources, kept in their browser and nowhere else.
 *
 * Same zero-knowledge shape as `installed-addons.ts`, for the same reason: a URL template a reader
 * typed in is theirs, this instance never fetches it, and there is no route that would take it to
 * the server. `SourceProviderConfig` (from `@golden/plugins`) is used verbatim as the stored record
 * — it already carries everything a settings screen needs (`name`, `urlTemplate`, `enabled`), so
 * there is no separate wire format to keep in sync with it.
 */

const STORAGE_KEY = 'btf.custom-sources';

export type StoredCustomSource = SourceProviderConfig;

function read(): StoredCustomSource[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StoredCustomSource[]) : [];
  } catch {
    // Private mode, disabled storage, or a hand-edited value. No custom sources is a valid state,
    // and a reader whose storage is broken should see an empty list rather than a stack trace.
    return [];
  }
}

function write(sources: readonly StoredCustomSource[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
    return true;
  } catch {
    return false; // see read()
  }
}

export function listCustomSources(): StoredCustomSource[] {
  return read();
}

export class DuplicateCustomSourceError extends Error {
  constructor(readonly name: string) {
    super(`${name} is already configured.`);
    this.name = 'DuplicateCustomSourceError';
  }
}

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'source';
}

/** First free `slugify(name)`, `-2`, `-3`, … — mirrors how `ProviderId` slugs are kept unique. */
function uniqueId(name: string, existing: readonly StoredCustomSource[]): string {
  const base = slugify(name);
  const taken = new Set(existing.map((source) => source.id));
  if (!taken.has(base)) return base;
  let attempt = 2;
  while (taken.has(`${base}-${attempt}`)) attempt += 1;
  return `${base}-${attempt}`;
}

export interface CustomSourceInput {
  readonly name: string;
  readonly urlTemplate: string;
  readonly params?: Readonly<Record<string, string>>;
}

/**
 * Adds one source. Validates the template before anything is written — `InvalidUrlTemplateError`
 * from `@golden/plugins` propagates to the caller unchanged, so a form can show the same message
 * `createCustomSourceProvider` would otherwise throw later, at resolve time.
 */
export function addCustomSource(input: CustomSourceInput): { persisted: boolean; id: string } {
  const name = input.name.trim();
  if (!name) throw new InvalidUrlTemplateError('A name is required.');
  const urlTemplate = input.urlTemplate.trim();
  assertHttpUrlTemplate(urlTemplate);

  const existing = read();
  if (existing.some((source) => source.name.trim().toLowerCase() === name.toLowerCase())) {
    throw new DuplicateCustomSourceError(name);
  }

  const id = uniqueId(name, existing);
  const config: StoredCustomSource = {
    id,
    name,
    urlTemplate,
    enabled: true,
    ...(input.params ? { params: input.params } : {}),
  };
  return { persisted: write([...existing, config]), id };
}

export function removeCustomSource(id: string): boolean {
  return write(read().filter((source) => source.id !== id));
}

export function setCustomSourceEnabled(id: string, enabled: boolean): boolean {
  return write(read().map((source) => (source.id === id ? { ...source, enabled } : source)));
}
