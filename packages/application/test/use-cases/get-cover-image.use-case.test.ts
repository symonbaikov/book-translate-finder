import type { FetchedImage, ImageFetchPort } from '@golden/domain';
import { describe, expect, it, vi } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import {
  coverCacheKey,
  GetCoverImage,
  type GetCoverImageDeps,
} from '../../src/use-cases/get-cover-image.use-case.js';

const BYTES = new Uint8Array([1, 2, 3, 4]);
const SRC = 'https://covers.openlibrary.org/b/id/8443266-L.jpg';

function makeDeps(image: FetchedImage | null = { bytes: BYTES, contentType: 'image/jpeg' }) {
  const cache = new InMemoryCache();
  const images: ImageFetchPort = { fetchImage: vi.fn(async () => image) };
  const deps: GetCoverImageDeps = { images, cache };
  return { deps, cache, images };
}

describe('GetCoverImage', () => {
  it('serves the bytes the source gave, unchanged', async () => {
    const { deps } = makeDeps();

    const result = await new GetCoverImage(deps).execute({ src: SRC });

    expect(result).toEqual({ status: 'ok', bytes: BYTES, contentType: 'image/jpeg' });
  });

  it('fetches once and serves every later reader from the cache', async () => {
    // The entire point: one cover costs two redirects and about 2.6 seconds at the source, and a
    // grid of them arrives one every few seconds. Only the first reader should ever pay that.
    const { deps, images } = makeDeps();
    const useCase = new GetCoverImage(deps);

    await useCase.execute({ src: SRC });
    const second = await useCase.execute({ src: SRC });

    expect(images.fetchImage).toHaveBeenCalledTimes(1);
    expect(second).toEqual({ status: 'ok', bytes: BYTES, contentType: 'image/jpeg' });
  });

  it('survives the round trip through the cache byte for byte', async () => {
    // Stored base64 in a JSON-valued cache — a corrupted encoding would show up as a broken image
    // for a month, which is the TTL.
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    const { deps } = makeDeps({ bytes: jpeg, contentType: 'image/jpeg' });
    const useCase = new GetCoverImage(deps);

    await useCase.execute({ src: SRC });
    const cached = await useCase.execute({ src: SRC });

    expect(cached).toMatchObject({ status: 'ok' });
    expect(cached.status === 'ok' && [...cached.bytes]).toEqual([...jpeg]);
  });

  it('refuses a host that is not on the allowlist, without asking for it', async () => {
    const { deps, images } = makeDeps();

    const result = await new GetCoverImage(deps).execute({
      src: 'https://169.254.169.254/latest/meta-data/',
    });

    expect(result).toEqual({ status: 'unavailable' });
    expect(images.fetchImage).not.toHaveBeenCalled();
  });

  it('reports unavailable, and caches nothing, when the source has no image', async () => {
    const { deps, cache } = makeDeps(null);

    const result = await new GetCoverImage(deps).execute({ src: SRC });

    expect(result).toEqual({ status: 'unavailable' });
    expect(await cache.get(coverCacheKey(SRC))).toBeNull();
  });
});
