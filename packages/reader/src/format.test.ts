import { describe, expect, it } from 'vitest';
import { isSupportedFormat, sniffFormat } from './format.js';

/** A ZIP whose first entry is `mimetype` holding a media type — how EPUB identifies itself. */
function zipWithMimetype(mediaType: string): Uint8Array {
  const bytes = new Uint8Array(38 + mediaType.length);
  bytes.set([0x50, 0x4b, 0x03, 0x04]);
  bytes.set(new TextEncoder().encode('mimetype'), 30);
  bytes.set(new TextEncoder().encode(mediaType), 38);
  return bytes;
}

function plainZip(): Uint8Array {
  const bytes = new Uint8Array(64);
  bytes.set([0x50, 0x4b, 0x03, 0x04]);
  return bytes;
}

function palmDb(signature: string): Uint8Array {
  const bytes = new Uint8Array(80);
  bytes.set(new TextEncoder().encode(signature), 60);
  return bytes;
}

describe('sniffFormat', () => {
  it('recognises an EPUB by its own media type, with no filename at all', () => {
    expect(sniffFormat(zipWithMimetype('application/epub+zip'))).toBe('epub');
  });

  it('recognises MOBI and the older PalmDoc signature', () => {
    expect(sniffFormat(palmDb('BOOKMOBI'))).toBe('mobi');
    expect(sniffFormat(palmDb('TEXtREAd'))).toBe('mobi');
  });

  it('recognises FB2 by its root element rather than by an XML declaration', () => {
    const fb2 = new TextEncoder().encode(
      '<?xml version="1.0" encoding="utf-8"?>\n<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0">',
    );
    expect(sniffFormat(fb2)).toBe('fb2');
  });

  it('believes the bytes over the extension — a MOBI named .epub is a MOBI', () => {
    expect(sniffFormat(palmDb('BOOKMOBI'), 'suspicious.epub')).toBe('mobi');
  });

  it('uses the extension only to tell ZIP flavours apart', () => {
    expect(sniffFormat(plainZip(), 'comic.cbz')).toBe('cbz');
    expect(sniffFormat(plainZip(), 'book.fbz')).toBe('fbz');
    expect(sniffFormat(plainZip(), 'book.fb2.zip')).toBe('fbz');
    // An out-of-spec EPUB whose mimetype entry was compressed: its name is the only evidence left.
    expect(sniffFormat(plainZip(), 'book.epub')).toBe('epub');
  });

  it('answers null rather than guessing when a ZIP says nothing about itself', () => {
    // A zip of images could be a comic or somebody's holiday photos, and guessing "comic" opens a
    // reader on the photos.
    expect(sniffFormat(plainZip(), 'archive.zip')).toBeNull();
    expect(sniffFormat(plainZip())).toBeNull();
  });

  it('answers null for a PDF, which is deliberately out of scope (ADR-0013 §8)', () => {
    expect(sniffFormat(new TextEncoder().encode('%PDF-1.7\n'), 'book.pdf')).toBeNull();
  });

  it('answers null for HTML that merely mentions FictionBook far down the page', () => {
    const html = new TextEncoder().encode(`<!doctype html><p>${'x'.repeat(4000)}<FictionBook>`);
    expect(sniffFormat(html, 'page.html')).toBeNull();
  });

  it('survives a file shorter than the offsets it reads', () => {
    expect(sniffFormat(new Uint8Array([0x50, 0x4b, 0x03, 0x04]))).toBeNull();
    expect(sniffFormat(new Uint8Array())).toBeNull();
  });
});

describe('isSupportedFormat', () => {
  it('narrows a null answer and rejects formats this reader does not render', () => {
    expect(isSupportedFormat('epub')).toBe(true);
    expect(isSupportedFormat('pdf')).toBe(false);
    expect(isSupportedFormat(null)).toBe(false);
  });
});
