# Images

## The logo

`logo.svg` — the site mark, also at `apps/web/public/logo.svg`. Original pixel art made for this
project (an open book with a ribbon, 16×16), so it carries the repository's MIT licence and a fork
inherits something it is actually allowed to use.

### Replacing it

Drop your own file at **`apps/web/public/logo.png`** and change the `src` in
`apps/web/src/components/Logo.tsx` to `/logo.png`. Put the same file at `docs/images/logo.png` and
update the image at the top of the README. Nothing else refers to the mark.

Use a square image, ideally 16×16 or a multiple of it — the mark is rendered with
`image-rendering: pixelated`, which is what keeps pixel art crisp and what would make a photograph
look wrong.

**Check the licence of whatever you drop in.** This project's whole argument is that it respects
other people's rights in what it links to; shipping a game texture or a stock clipart as its own
mark would undercut that in the one place every visitor looks. Game and film assets are almost
never redistributable, whatever the site you found them on implies.
