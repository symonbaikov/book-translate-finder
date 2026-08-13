import { InvalidInputError } from '../errors/domain-error.js';

function stripSeparators(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase();
}

function isValidIsbn10(digits: string): boolean {
  if (!/^\d{9}[\dX]$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  sum += digits[9] === 'X' ? 10 : Number(digits[9]);
  return sum % 11 === 0;
}

function isValidIsbn13(digits: string): boolean {
  if (!/^\d{13}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += Number(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return sum % 10 === 0;
}

function isbn10ToIsbn13(isbn10: string): string {
  const core = `978${isbn10.slice(0, 9)}`;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(core[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return `${core}${check}`;
}

/**
 * Always normalized to its canonical ISBN-13 form, regardless of whether the input was
 * ISBN-10 or ISBN-13 — this is what `edition.natural_key` is built from (docs/rules.md §2.2),
 * so two editions supplied as "0-14-143951-7" and "9780141439518" must resolve to the same key.
 */
export class Isbn {
  private constructor(private readonly isbn13: string) {}

  static create(input: string): Isbn {
    const stripped = stripSeparators(input);

    if (isValidIsbn13(stripped)) {
      return new Isbn(stripped);
    }
    if (isValidIsbn10(stripped)) {
      return new Isbn(isbn10ToIsbn13(stripped));
    }
    throw new InvalidInputError(`Invalid ISBN (failed checksum): ${JSON.stringify(input)}`);
  }

  get value(): string {
    return this.isbn13;
  }

  equals(other: Isbn): boolean {
    return this.isbn13 === other.isbn13;
  }

  toString(): string {
    return this.isbn13;
  }
}
