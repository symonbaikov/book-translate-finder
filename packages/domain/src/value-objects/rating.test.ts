import { describe, expect, it } from 'vitest';
import { InvalidInputError } from '../errors/domain-error.js';
import { MIN_VOTES_FOR_COMPARISON, RATING_SCALE, Rating } from './rating.js';

describe('Rating.create', () => {
  it('keeps the average, the scale and the vote count', () => {
    const rating = Rating.create(4.25, 120);

    expect(rating.average).toBeCloseTo(4.25);
    expect(rating.outOf).toBe(RATING_SCALE);
    expect(rating.votes).toBe(120);
    expect(rating.fraction).toBeCloseTo(0.85);
  });

  it('refuses a rating nobody cast', () => {
    expect(() => Rating.create(4, 0)).toThrow(InvalidInputError);
  });

  it.each([-0.1, 5.1, Number.NaN])('refuses an average off the scale: %s', (average) => {
    expect(() => Rating.create(average, 10)).toThrow(InvalidInputError);
  });

  it('refuses a fractional vote count', () => {
    expect(() => Rating.create(4, 1.5)).toThrow(InvalidInputError);
  });

  it.each([0, -5])('refuses a scale of %s', (outOf) => {
    expect(() => Rating.create(1, 10, outOf)).toThrow(InvalidInputError);
  });

  it('marks a handful of votes as too few to compare translations on', () => {
    expect(Rating.create(5, MIN_VOTES_FOR_COMPARISON - 1).isLowConfidence).toBe(true);
    expect(Rating.create(5, MIN_VOTES_FOR_COMPARISON).isLowConfidence).toBe(false);
  });
});

describe('Rating.aggregate', () => {
  it('answers null for a translator with no rated edition', () => {
    expect(Rating.aggregate([])).toBeNull();
  });

  it('weights by voters, not by edition', () => {
    // The trap this exists for: two readers loving one printing must not outrank four hundred
    // readers of another. A mean of means would answer 4.4 here.
    const aggregate = Rating.aggregate([Rating.create(5, 2), Rating.create(3.8, 400)]);

    expect(aggregate).not.toBeNull();
    expect(aggregate!.average).toBeCloseTo(3.806, 2);
    expect(aggregate!.votes).toBe(402);
  });

  it('sums the voters behind every edition it covers', () => {
    const aggregate = Rating.aggregate([
      Rating.create(4, 10),
      Rating.create(4, 20),
      Rating.create(4, 30),
    ]);

    expect(aggregate!.votes).toBe(60);
    expect(aggregate!.average).toBeCloseTo(4);
  });

  it('normalizes across scales instead of letting the wider one dominate', () => {
    const aggregate = Rating.aggregate([Rating.create(4, 50), Rating.create(80, 50, 100)]);

    // Both sources say 80% of their own scale; the answer is 80% of five stars.
    expect(aggregate!.outOf).toBe(RATING_SCALE);
    expect(aggregate!.average).toBeCloseTo(4);
  });
});

describe('Rating.toDisplay', () => {
  it.each([
    [3.966386554621849, 4],
    [4.25, 4.3],
    [3.94, 3.9],
  ])('rounds %s to %s', (average, expected) => {
    expect(Rating.create(average, 10).toDisplay()).toBe(expected);
  });
});
