# Images

## The logo

`logo.svg` — the site mark, also at `apps/web/public/logo.svg`. An open book, drawn for this
project as vector paths on a 128×128 viewBox, so it carries the repository's MIT licence and a fork
inherits something it is actually allowed to use. Being a vector, the same file serves the 28px
header mark, the browser tab icon, and the 72px image at the top of the README.

The drawing is one half — three leaves and the page in front of them — mirrored about the spine,
so an edit to the right-hand side is an edit to both. The two copies live in step: change
`apps/web/public/logo.svg` and copy it over `docs/images/logo.svg`.

### Replacing it

Drop your own file at **`apps/web/public/logo.png`** and change the `src` in
`apps/web/src/components/Logo.tsx` to `/logo.png`. Put the same file at `docs/images/logo.png` and
update the image at the top of the README. Nothing else refers to the mark.

Use a square image, and one that survives being shrunk to 28px — the header renders it that small,
and detail that reads at 128px turns to mush there.

**Check the licence of whatever you drop in.** This project's whole argument is that it respects
other people's rights in what it links to; shipping a game texture or a stock clipart as its own
mark would undercut that in the one place every visitor looks. Game and film assets are almost
never redistributable, whatever the site you found them on implies.
