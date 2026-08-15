import { InvalidInputError } from '../errors/domain-error.js';

/**
 * An amount in one currency, held in minor units.
 *
 * **Minor units, never floats.** `19.99` is not representable in binary floating point, and a
 * price aggregator that adds, sorts and compares such values across providers accumulates the
 * error until it shows a reader a price that no shop charges. Everything here is an integer count
 * of cents (or fils, or yen).
 *
 * **No conversion between currencies.** `Money` normalizes the *code* — `usd` and `USD` are the
 * same currency — and nothing else. Converting €9.99 into dollars needs an exchange rate from a
 * source we do not have, and a converted price is not the price the reader will pay. The UI shows
 * each offer in the currency its shop quoted (docs/plan.md 4.10: show what a source states, never
 * a guess).
 */

/**
 * ISO 4217 exponents that are not 2. Every other currency is assumed to have two minor digits,
 * which is true for all but these.
 */
const CURRENCY_EXPONENTS: Readonly<Record<string, number>> = {
  BIF: 0,
  CLP: 0,
  DJF: 0,
  GNF: 0,
  ISK: 0,
  JPY: 0,
  KMF: 0,
  KRW: 0,
  MGA: 0,
  PYG: 0,
  RWF: 0,
  UGX: 0,
  UYI: 0,
  VND: 0,
  VUV: 0,
  XAF: 0,
  XOF: 0,
  XPF: 0,
  BHD: 3,
  IQD: 3,
  JOD: 3,
  KWD: 3,
  LYD: 3,
  OMR: 3,
  TND: 3,
};

const DEFAULT_EXPONENT = 2;

/** How many minor digits a currency has — 0 for JPY, 3 for KWD, 2 for the rest. */
export function currencyExponent(currency: string): number {
  return CURRENCY_EXPONENTS[currency.toUpperCase()] ?? DEFAULT_EXPONENT;
}

/** ISO 4217 is exactly three letters; anything else is a source bug we refuse to propagate. */
export function normalizeCurrencyCode(raw: string): string {
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) {
    throw new InvalidInputError(`Not an ISO 4217 currency code: ${JSON.stringify(raw)}`);
  }
  return code;
}

export class Money {
  private constructor(
    readonly amountMinor: number,
    readonly currency: string,
  ) {}

  static fromMinor(amountMinor: number, currency: string): Money {
    if (!Number.isInteger(amountMinor)) {
      throw new InvalidInputError(`Minor-unit amount must be an integer, got: ${amountMinor}`);
    }
    if (amountMinor < 0) {
      throw new InvalidInputError(`A price cannot be negative: ${amountMinor}`);
    }
    return new Money(amountMinor, normalizeCurrencyCode(currency));
  }

  /**
   * Builds from the decimal a source quotes (`3.99`). Rounds to the currency's own precision:
   * a provider sending `3.999` for USD means 4.00, and truncating instead would understate a
   * price, which is the direction that misleads a reader into a purchase.
   */
  static fromDecimal(amount: number, currency: string): Money {
    if (!Number.isFinite(amount)) {
      throw new InvalidInputError(`Price amount must be a finite number, got: ${amount}`);
    }
    const code = normalizeCurrencyCode(currency);
    const factor = 10 ** currencyExponent(code);
    return Money.fromMinor(Math.round(amount * factor), code);
  }

  /** The decimal value, for display and for serialization to clients that expect one. */
  toDecimal(): number {
    return this.amountMinor / 10 ** currencyExponent(this.currency);
  }

  equals(other: Money): boolean {
    return this.amountMinor === other.amountMinor && this.currency === other.currency;
  }

  /**
   * Orders two prices, or returns `null` when they are in different currencies — the honest
   * answer without an exchange rate. Callers group by currency before sorting rather than
   * pretending the comparison exists.
   */
  static compare(a: Money, b: Money): number | null {
    if (a.currency !== b.currency) return null;
    return a.amountMinor - b.amountMinor;
  }
}
