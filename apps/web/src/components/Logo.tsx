import Image from 'next/image';

/**
 * The site mark.
 *
 * Points at `/logo.png` when an instance ships one and falls back to the committed `/logo.svg`
 * otherwise — swapping the logo is dropping a file in `apps/web/public/`, not a code change. The
 * default mark is original artwork so a fork inherits something it is actually allowed to use;
 * see docs/images/README.md.
 */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/logo.svg"
      alt=""
      width={size}
      height={size}
      // Pixel art: browsers must not smooth it into mush when it is scaled.
      style={{ imageRendering: 'pixelated' }}
      priority
    />
  );
}
