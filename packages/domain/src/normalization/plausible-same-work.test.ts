import { describe, expect, it } from 'vitest';
import { isPlausibleSameWork } from './plausible-same-work.js';

describe('isPlausibleSameWork', () => {
  it('rejects the answer that prompted it — a different book entirely', () => {
    // Enrichment asked Project Gutenberg for "It Stephen King"; Gutendex answered with an
    // unrelated public domain diary, and it became an edition of *It* with a free download.
    expect(
      isPlausibleSameWork(
        { title: 'It', author: 'Stephen King' },
        {
          title: 'The Diary of a U-boat Commander: With an Introduction and Explanatory Notes',
          authorNames: ['Etienne'],
        },
      ),
    ).toBe(false);
  });

  it('accepts a translation whose title shares nothing with the original', () => {
    // The product's entire subject. A rule keyed on title similarity would reject this.
    expect(
      isPlausibleSameWork(
        { title: 'Het Achterhuis', author: 'Anne Frank' },
        { title: 'The Diary of a Young Girl', authorNames: ['Frank, Anne'] },
      ),
    ).toBe(true);
  });

  it('accepts the same author written the other way round', () => {
    expect(
      isPlausibleSameWork(
        { title: 'Dracula', author: 'Bram Stoker' },
        { title: 'Dracula', authorNames: ['Stoker, Bram'] },
      ),
    ).toBe(true);
  });

  it('brings a Cyrillic author together with its romanization', () => {
    // The case the enrichment path was built for: a German catalogue files the novel as "Laurus"
    // by "Vodolazkin, Evgenij Germanovič" and knows nothing under either Cyrillic word.
    expect(
      isPlausibleSameWork(
        { title: 'Лавр', author: 'Евгений Водолазкин' },
        { title: 'Laurus', authorNames: ['Vodolazkin, Evgenij Germanovič'] },
      ),
    ).toBe(true);
  });

  it('does not accept shared initials as agreement', () => {
    // "J. K." and "J. R. R." share two initials and nothing else.
    expect(
      isPlausibleSameWork(
        { title: 'Harry Potter and the Philosopher’s Stone', author: 'J. K. Rowling' },
        { title: 'The Hobbit', authorNames: ['J. R. R. Tolkien'] },
      ),
    ).toBe(false);
  });

  it('rejects a sequel handed back in place of the book asked about', () => {
    expect(
      isPlausibleSameWork(
        { title: 'Metro 2033', author: 'Dmitry Glukhovsky' },
        { title: 'Metro 2035', authorNames: ['Dmitry Glukhovsky'] },
      ),
    ).toBe(false);
  });

  it('declines to object when one side has no usable author', () => {
    // An unnamed author is not evidence of a mismatch, and this guard only ever says no for cause.
    expect(
      isPlausibleSameWork(
        { title: 'Beowulf', author: 'Unknown' },
        { title: 'Beowulf', authorNames: [] },
      ),
    ).toBe(true);
  });

  it('declines to object across scripts it cannot bring together', () => {
    // A documented limitation rather than a silent guess: romanization covers Cyrillic, not
    // Japanese, so there are no comparable tokens and the guard abstains.
    expect(
      isPlausibleSameWork(
        { title: '雪国', author: '川端康成' },
        { title: 'Snow Country', authorNames: ['Kawabata, Yasunari'] },
      ),
    ).toBe(true);
  });

  it.each([
    ['Leo Tolstoy', 'Tolstoï, Léon', 'La Guerre et la Paix'],
    ['Fyodor Dostoyevsky', 'Dostoevsky, Fyodor', 'The Brothers Karamazov'],
    ['Yevgeny Zamyatin', 'Zamiatin, Evgueni', 'Nous autres'],
  ])('accepts a surname carried into another language: %s ≈ %s', (known, candidate, title) => {
    // A catalogue in another language spells the surname its own way. Character-for-character
    // equality would reject exactly the cross-language records this project goes looking for.
    expect(
      isPlausibleSameWork({ title: 'x', author: known }, { title, authorNames: [candidate] }),
    ).toBe(true);
  });

  it('does not stretch that tolerance to short words that merely rhyme', () => {
    expect(
      isPlausibleSameWork(
        { title: 'It', author: 'Stephen King' },
        { title: 'The Ring', authorNames: ['Anna Ring'] },
      ),
    ).toBe(false);
  });

  it('matches on a surname even when the given names are spelled differently', () => {
    expect(
      isPlausibleSameWork(
        { title: 'Crime and Punishment', author: 'Fyodor Dostoyevsky' },
        { title: 'Преступление и наказание', authorNames: ['Dostoyevsky, F. M.'] },
      ),
    ).toBe(true);
  });
});
