import { InvalidInputError } from '../errors/domain-error.js';

/**
 * An email address, normalized for identity.
 *
 * Normalization is lowercase + trim and nothing else. Deliberately not "gmail dot-stripping" or
 * plus-tag removal: those rules are provider-specific folklore, they are wrong for most hosts, and
 * applying them would silently merge two people's accounts. Case-insensitivity is the one rule
 * that is safe — the domain part is case-insensitive by RFC, and no real mail host treats the
 * local part case-sensitively.
 *
 * Validation is deliberately loose. A regex cannot decide whether an address is deliverable, and
 * a strict one rejects valid addresses (apostrophes, new TLDs, IDN). The real proof of ownership
 * is the welcome mail arriving, not a pattern match.
 */
export class EmailAddress {
  private constructor(readonly value: string) {}

  static create(input: string): EmailAddress {
    const normalized = input.trim().toLowerCase();
    if (normalized.length === 0) {
      throw new InvalidInputError('Email must not be empty');
    }
    if (normalized.length > 254) {
      // RFC 5321's limit on a forward path — anything longer cannot be delivered anyway.
      throw new InvalidInputError('Email must be at most 254 characters');
    }
    const at = normalized.indexOf('@');
    if (at <= 0 || at !== normalized.lastIndexOf('@') || at === normalized.length - 1) {
      throw new InvalidInputError(`Not a valid email address: ${JSON.stringify(input)}`);
    }
    if (/\s/.test(normalized)) {
      throw new InvalidInputError('Email must not contain whitespace');
    }
    return new EmailAddress(normalized);
  }
}
