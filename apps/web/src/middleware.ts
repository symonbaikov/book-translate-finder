import { NextResponse, type NextRequest } from 'next/server';

/**
 * The reading route's Content-Security-Policy — the wall that stops a book's own JavaScript.
 *
 * This is one of the two walls ADR-0013 §3 stands on, and on WebKit it is the only one: that engine
 * delivers no input at all to a frame without `allow-scripts` (bug 218086, measured in spike 11.1b),
 * so there the frame keeps the token and this header is what refuses the book.
 *
 * ## Why a nonce, and not a static header in next.config.mjs
 *
 * `script-src 'self'` alone would break the page: Next injects inline `<script>` tags for hydration
 * and streaming, and they would be refused along with the book's. The two ways out are
 * `'unsafe-inline'` — which would also permit every inline script in every EPUB, i.e. exactly the
 * thing being prevented — and a per-request nonce, which is why this file exists at all. A nonce
 * cannot come from a static config, and Next reads it from the request header set below.
 *
 * `'strict-dynamic'` is what lets the nonced bootstrap load the rest of the application, including
 * the renderer's lazy imports. It does not extend to the book: scripts written into a document by
 * the parser are not "created by a trusted script", and each section reaches the frame as a parsed
 * `blob:` document.
 *
 * ## The line to be careful with
 *
 * If anyone ever adds `'unsafe-inline'` or `blob:` to `script-src` here — to placate a widget, an
 * analytics snippet, a chart library — they will also have re-enabled arbitrary JavaScript shipped
 * inside strangers' EPUB files, and on Safari nothing else would stop it. That is the whole reason
 * this policy is scoped to `/read` instead of being a site-wide header somebody tunes for other
 * reasons.
 */
function readerCsp(nonce: string): string {
  const dev = process.env.NODE_ENV === 'development';
  return [
    "default-src 'self'",
    // Two shapes, and the difference is confined to what development needs:
    //
    //   production  'self' 'nonce-…' 'strict-dynamic'
    //   development 'self' 'nonce-…' 'unsafe-eval'
    //
    // `'unsafe-eval'` because the dev server's hot reloader compiles modules with it. And
    // `'strict-dynamic'` is *dropped* in development rather than added to, because it disables
    // host-based allowlisting entirely, and Next's dev-only fallback chunks (`/_next/static/chunks/
    // fallback/…`) carry no nonce — with it, a dev page is a wall of refusals and no application.
    //
    // What does not differ is the part that matters: neither shape contains `'unsafe-inline'` or
    // `blob:`, so a book's inline script and its `blob:`-served script are refused in development
    // exactly as in production. A hostile fixture tested against the dev server is testing the real
    // policy — which is the only reason this split is acceptable at all.
    dev
      ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // The renderer injects the reader's type and theme choices into each section as inline styles,
    // and serves the book's own stylesheets as `blob:`. Styles cannot execute; scripts can, and
    // that asymmetry is why one list is permissive and the other is not.
    "style-src 'self' 'unsafe-inline' blob: data:",
    // Cover images and the book's own illustrations, which arrive as `blob:` out of the archive.
    "img-src 'self' blob: data:",
    "font-src 'self' blob: data:",
    // Deliberately wide, and it is the feature: the reader's browser fetches the book from whichever
    // host the reader chose, and narrowing this would mean this instance keeping a list of approved
    // sources — the editorial act ADR-0009 exists to refuse. What it does *not* permit is the book
    // reaching the network, because the book has no way to run.
    "connect-src 'self' https: http:",
    // Each section of the book is rendered in a frame from a `blob:` URL.
    'frame-src blob:',
    "object-src 'none'",
    "base-uri 'none'",
    // A book that contained a form could not submit it anywhere, including back to this instance.
    "form-action 'none'",
    "frame-ancestors 'self'",
  ].join('; ');
}

export function middleware(request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = readerCsp(nonce);

  // Next reads the nonce out of the `Content-Security-Policy` *request* header and stamps it onto
  // the scripts it injects. Setting only the response header would produce a policy that refuses
  // the framework's own bootstrap, which fails as a blank page rather than as an error.
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

/**
 * Scoped to the reading route on purpose.
 *
 * A site-wide CSP is a good idea and a different change: it would be tuned by people thinking about
 * analytics and embeds, and this policy has to be read as "the thing stopping a stranger's code".
 * Mixing those two audiences into one header is how the dangerous edit gets made for a harmless
 * reason.
 */
export const config = {
  matcher: ['/read', '/read/:path*'],
};
