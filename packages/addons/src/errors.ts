/**
 * Every failure an addon can cause, named by whose fault it is.
 *
 * The distinction is not pedantry — it decides what the interface says. A manifest this engine
 * cannot read is the addon author's problem and the reader should not install it; a request that
 * timed out is nobody's fault and worth retrying; a response that does not match the contract means
 * the addon is running but broken, which is the one case where naming the addon in the message
 * actually helps the reader decide whether to keep it.
 */
export class AddonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** The manifest is missing, unreadable, or describes an addon this engine cannot talk to. */
export class AddonManifestError extends AddonError {}

/** The request never produced an answer: offline, DNS, CORS, timeout, non-2xx status. */
export class AddonTransportError extends AddonError {
  constructor(
    message: string,
    readonly status: number | null = null,
  ) {
    super(message);
  }
}

/** An answer arrived and did not match the contract. */
export class AddonResponseError extends AddonError {
  constructor(
    message: string,
    readonly addonId: string,
  ) {
    super(message);
  }
}
