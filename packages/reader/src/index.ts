/**
 * `@golden/reader` — reading a book in the reader's own tab.
 *
 * A leaf, twice over, like `@golden/addons`: it depends on no workspace package, and nothing that
 * runs on a server may import it at all. That second half is the feature — a book, where it came
 * from, and how far somebody got through it never reach this instance
 * ([ADR-0013](../../../docs/adr/0013-client-side-reader.md) §1), and `pnpm boundaries` makes that a
 * build failure rather than a promise.
 *
 * The renderer is a patched, vendored copy of foliate-js reached through `foliate.ts` and nothing
 * else; `vendor/VENDOR.md` says what the patch is and why the reader's safety depends on it.
 */

export {
  AcquisitionError,
  ReaderError,
  UnsupportedFormatError,
  type AcquisitionFailure,
} from './errors.js';

export {
  acquireFromFile,
  acquireFromStored,
  acquireFromUrl,
  isFetchableBookUrl,
  type AcquireOptions,
  type AcquiredBook,
  type BookOrigin,
} from './acquisition.js';

export {
  SANDBOX_WITHOUT_SCRIPTS,
  SANDBOX_WITH_SCRIPTS,
  contentFramePolicy,
  installContentFramePolicy,
  installedContentFrameSandbox,
  type ContentFramePolicy,
} from './content-frame.js';

export { READER_FORMATS, isSupportedFormat, sniffFormat, type ReaderFormat } from './format.js';

export { contentHashOf, isContentHash } from './identity.js';

export {
  isReadingRecord,
  newReadingRecord,
  withBookmark,
  withKeepFile,
  withPosition,
  withoutBookmark,
  type Bookmark,
  type ReadingPosition,
  type ReadingRecord,
} from './progress.js';

export {
  asFoliateFile,
  loadFoliate,
  renderFirstPage,
  titleOf,
  type FoliateBookMetadata,
  type FoliateRelocateDetail,
  type FoliateView,
} from './foliate.js';
