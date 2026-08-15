import { describe, expect, it } from 'vitest';
import { InvalidInputError } from '../errors/domain-error.js';
import { Money, currencyExponent, normalizeCurrencyCode } from './money.js';

describe('normalizeCurrencyCode', () => {
  it.each([
    ['usd', 'USD'],
    ['  eur ', 'EUR'],
    ['JPY', 'JPY'],
  ])('normalizes %s to %s', (raw, expected) => {
    expect(normalizeCurrencyCode(raw)).toBe(expected);
  });

  it.each(['US', 'DOLLAR', '', 'US$'])('rejects %s', (raw) => {
    expect(() => normalizeCurrencyCode(raw)).toThrow(InvalidInputError);
  });
});

describe('currencyExponent', () => {
  it.each([
    ['USD', 2],
    ['EUR', 2],
    ['JPY', 0],
    ['KRW', 0],
    ['KWD', 3],
    // An unlisted but valid code falls back to the two-digit default rather than failing.
    ['XYZ', 2],
  ])('%s has %i minor digits', (currency, exponent) => {
    expect(currencyExponent(currency)).toBe(exponent);
  });
});

describe('Money.fromDecimal', () => {
  it('stores a two-decimal price as an exact integer of minor units', () => {
    // 19.99 has no exact binary representation; the point of minor units is that this is 1999.
    expect(Money.fromDecimal(19.99, 'usd').amountMinor).toBe(1999);
  });

  it.each([
    [1200, 'JPY', 1200],
    [12.345, 'KWD', 12345],
    [3.999, 'USD', 400],
  ])('respects the currency’s own precision for %s %s', (amount, currency, minor) => {
    expect(Money.fromDecimal(amount, currency).amountMinor).toBe(minor);
  });

  it('round-trips back to the decimal a shop would print', () => {
    expect(Money.fromDecimal(19.99, 'EUR').toDecimal()).toBe(19.99);
    expect(Money.fromDecimal(1200, 'JPY').toDecimal()).toBe(1200);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])('rejects %s', (amount) => {
    expect(() => Money.fromDecimal(amount, 'USD')).toThrow(InvalidInputError);
  });

  it('rejects a negative price rather than displaying one', () => {
    expect(() => Money.fromDecimal(-1, 'USD')).toThrow(InvalidInputError);
  });
});

describe('Money.compare', () => {
  it('orders two prices in the same currency', () => {
    const cheap = Money.fromDecimal(5, 'EUR');
    const dear = Money.fromDecimal(12, 'EUR');
    expect(Money.compare(cheap, dear)).toBeLessThan(0);
  });

  it('refuses to compare across currencies instead of inventing a rate', () => {
    expect(Money.compare(Money.fromDecimal(5, 'EUR'), Money.fromDecimal(5, 'USD'))).toBeNull();
  });

  it('treats the same amount in the same currency as equal', () => {
    expect(Money.fromDecimal(9.5, 'gbp').equals(Money.fromMinor(950, 'GBP'))).toBe(true);
  });
});
