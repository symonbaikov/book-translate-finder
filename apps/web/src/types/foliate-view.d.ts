import type { FoliateView } from '@golden/reader';

/**
 * `<foliate-view>` is a custom element defined at runtime by the vendored renderer, so JSX has no
 * idea it exists until it is declared here. The element's typed surface lives in `@golden/reader`
 * (`src/foliate.ts`) — this file only tells React that the tag is spellable, and reuses that type
 * rather than describing the element a second time.
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'foliate-view': React.DetailedHTMLProps<
        React.HTMLAttributes<FoliateView> & { class?: string | undefined },
        FoliateView
      >;
    }
  }
}
