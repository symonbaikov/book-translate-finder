import { notFound } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  Chip,
  ChipToggle,
  Cluster,
  Field,
  Poster,
  PosterGrid,
  Section,
  Sheet,
  Skeleton,
  TextInput,
} from '../../ui';
import { SelectSpecimen } from './SelectSpecimen';
import styles from './design.module.css';

/**
 * The specimen: every token and every primitive on one page, in whichever theme the reader's
 * system is set to.
 *
 * It exists because a redesign spread over several commits needs somewhere the *system* can be
 * looked at rather than inferred from whichever page happens to be open — and because a component
 * that only ever appears three screens deep is a component nobody checks.
 *
 * Not reachable in production. This is a workshop, not a page of the product: it is untranslated,
 * unlinked, and would be a strange thing for a reader to land on.
 */
export default function DesignPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main id="main-content" className={styles.page}>
      <h1>Design system</h1>
      <p className={styles.note}>
        Light and dark follow your system setting — switch it to see both. Every value here comes
        from <code>src/styles/tokens.css</code>; every component from <code>src/ui</code>. Nothing
        on this page defines a colour of its own.
      </p>

      <Section title="Accent — warm brass">
        <p className={styles.note}>
          One accent, and it is the only filled colour on a page: if something is solid brass, it is
          the thing to press. Measured contrast is 4.95 as text on light and 9.05 on dark; the label
          inside a brass button runs white on light and near-black on dark, at 4.95 and 9.98.
        </p>
        <Card className={styles.spaced}>
          <Cluster>
            <Button variant="primary">Download EPUB</Button>
            <Button variant="secondary">Save</Button>
            <Button variant="ghost">Hide this genre</Button>
            <Button variant="danger">Remove</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" loading>
              Searching
            </Button>
          </Cluster>
        </Card>
      </Section>

      <Section title="Control sizes">
        <p className={styles.note}>
          44px is the floor for anything pressed with a finger. Small exists only for a control that
          sits inside a larger tap area.
        </p>
        <Card className={styles.spaced}>
          <Cluster>
            <Button size="sm" variant="secondary">
              36 small
            </Button>
            <Button size="md" variant="secondary">
              44 medium
            </Button>
            <Button size="lg" variant="primary">
              52 large
            </Button>
            <Button size="xl" variant="primary">
              56 hero
            </Button>
          </Cluster>
        </Card>
      </Section>

      <Section title="Type scale">
        <div className={styles.typeRow}>
          <span className={styles.typeMeta}>step 6 · display</span>
          <span className={styles.display} style={{ fontSize: 'var(--step-6)' }}>
            Война и мир
          </span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.typeMeta}>step 5 · display</span>
          <span className={styles.display} style={{ fontSize: 'var(--step-5)' }}>
            One Hundred Years of Solitude
          </span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.typeMeta}>step 4 · display</span>
          <span className={styles.display} style={{ fontSize: 'var(--step-4)' }}>
            Хребты безумия
          </span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.typeMeta}>step 3 · ui 600</span>
          <span style={{ fontSize: 'var(--step-3)', fontWeight: 'var(--weight-semibold)' }}>
            Translated into 47 languages
          </span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.typeMeta}>step 1 · ui 500</span>
          <span style={{ fontSize: 'var(--step-1)', fontWeight: 'var(--weight-medium)' }}>
            Издания на русском · 12
          </span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.typeMeta}>step 0 · ui 400</span>
          <span>
            Public domain in the United States. Direct download available in EPUB, MOBI and plain
            text.
          </span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.typeMeta}>step −1 · muted</span>
          <span style={{ fontSize: 'var(--step--1)', color: 'var(--text-muted)' }}>
            Penguin Classics · London · 2003 · ISBN 978-0-14-044913-6
          </span>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.typeMeta}>step −2 · faint</span>
          <span style={{ fontSize: 'var(--step--2)', color: 'var(--text-faint)' }}>
            Source: Open Library · last synchronised 4 hours ago
          </span>
        </div>
      </Section>

      <Section title="Covers">
        <p className={styles.note}>
          A missing cover is not an error state. Open Library has no image for a large share of
          works, and an ISBN-derived URL is a guess that often 404s — so the fallback is the title
          set in the reading face, which is what a plain clothbound book looks like anyway.
        </p>
        <PosterGrid className={styles.spaced} minWidth="150px">
          <li>
            <Poster src={null} title="Crime and Punishment" author="Fyodor Dostoevsky" />
          </li>
          <li>
            <Poster src={null} title="Сто лет одиночества" author="Габриэль Гарсиа Маркес" />
          </li>
          <li>
            <Poster
              src={null}
              title="The Strange Case of Dr Jekyll and Mr Hyde and Other Tales of Terror"
              author="Robert Louis Stevenson"
            />
          </li>
          <li>
            <Skeleton shape="poster" />
          </li>
        </PosterGrid>
      </Section>

      <Section title="Rights status">
        <p className={styles.note}>
          Outlined rather than filled, so that a solid colour always means &ldquo;press me&rdquo;
          and never &ldquo;here is a fact&rdquo;. The glyph is not decoration: rights status is the
          one thing on this site that must not be guessed, and colour alone excludes anyone who
          cannot separate these hues.
        </p>
        <Cluster className={styles.spaced}>
          <Badge tone="positive">Public domain</Badge>
          <Badge tone="positive">Open license</Badge>
          <Badge tone="neutral" glyph="©">
            Copyrighted
          </Badge>
          <Badge tone="caution">Status unknown</Badge>
          <Badge tone="info">Borrow from a library</Badge>
        </Cluster>
      </Section>

      <Section title="Chips">
        <Cluster>
          <ChipToggle selected count={12}>
            Русский
          </ChipToggle>
          <ChipToggle selected={false} count={8}>
            Deutsch
          </ChipToggle>
          <ChipToggle selected={false} count={3}>
            日本語
          </ChipToggle>
          <Chip>EPUB</Chip>
          <Chip>Hardcover</Chip>
        </Cluster>
      </Section>

      <Section title="Fields">
        <div className={styles.fields}>
          <Field label="Book title and author" htmlFor="specimen-hero">
            <TextInput id="specimen-hero" size="hero" placeholder="Война и мир Толстой" />
          </Field>
          <Field label="Shopping country" htmlFor="specimen-select" hint="Used to rank bookshops.">
            <SelectSpecimen />
          </Field>
          <Field
            label="Catalog address"
            htmlFor="specimen-error"
            error="That address answered 401 — it needs a username and password."
          >
            <TextInput id="specimen-error" defaultValue="https://calibre.example/opds" />
          </Field>
        </div>
      </Section>

      <Section title="Disclosure">
        <p className={styles.note}>
          The panel animates to its content&rsquo;s real height rather than to a guessed maximum,
          and stays mounted when closed so that links already fetched are not thrown away.
        </p>
        <Card className={styles.spaced}>
          <Button variant="secondary" aria-expanded aria-controls="specimen-sheet">
            Show links
          </Button>
          <Sheet open id="specimen-sheet">
            <Cluster>
              <Badge tone="positive">Public domain</Badge>
              <span style={{ color: 'var(--text-muted)' }}>Project Gutenberg · EPUB, MOBI</span>
            </Cluster>
          </Sheet>
        </Card>
      </Section>

      <Section title="Surfaces and depth">
        <div className={styles.surfaces}>
          <div className={`${styles.surface} ${styles.s0}`}>--bg · the page</div>
          <div className={`${styles.surface} ${styles.s1}`}>--surface-1 · a card</div>
          <div className={`${styles.surface} ${styles.s2}`}>--surface-2 · a raised panel</div>
          <div className={`${styles.surface} ${styles.s3}`}>--surface-3 · a sheet</div>
        </div>
      </Section>
    </main>
  );
}
