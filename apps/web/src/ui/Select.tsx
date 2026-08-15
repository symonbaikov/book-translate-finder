'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { cx } from './cx';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

/** How long a run of typed letters counts as one word, matching the native select's own timeout. */
const TYPE_AHEAD_MS = 700;

function Chevron() {
  return (
    <svg
      className={styles.chevron}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6.5 8 10.5 12 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg
      className={styles.check}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m3.5 8.5 3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The application's dropdown.
 *
 * It replaces `<select>` because a native one is drawn by the operating system and cannot be given
 * this design's surfaces, type or motion — which is exactly what a reader notices first when a
 * grey system menu drops out of a page that has neither. What the native element gave away for
 * free is rebuilt here on purpose:
 *
 * - `role="combobox"` on the trigger, `role="listbox"` on the panel, `aria-activedescendant`
 *   rather than roving focus, so a screen reader announces the option under the cursor while the
 *   trigger keeps focus.
 * - Arrow keys, Home and End to move, Enter or Space to take, Escape to leave it as it was.
 * - Type-ahead: typing "укр" jumps to Українська, the way a native select does.
 * - Focus returns to the trigger on close, always. A dropdown that swallows focus strands anyone
 *   navigating by keyboard.
 *
 * The one thing genuinely lost is the mobile wheel picker on iOS and Android. The panel is built
 * to be usable in its place — 44px rows, a scrollable list, and a tap target the size of the whole
 * row rather than the text in it.
 */
export function Select({
  value,
  onChange,
  options,
  id,
  disabled = false,
  size = 'default',
  bare = false,
  block = false,
  align = 'start',
  placeholder,
  className,
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  disabled?: boolean;
  size?: 'compact' | 'default' | 'hero';
  /** No border or background until hovered — for a control that sits in the site chrome. */
  bare?: boolean;
  block?: boolean;
  /** Which edge the panel hangs from. `end` for a control at the end of a row. */
  align?: 'start' | 'end';
  /** Shown when `value` matches no option. */
  placeholder?: string;
  className?: string | undefined;
  'aria-label'?: string;
}) {
  const generatedId = useId();
  const triggerId = id ?? `${generatedId}-trigger`;
  const listId = `${generatedId}-list`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropUp, setDropUp] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', at: 0 });

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const openPanel = useCallback(() => {
    if (disabled) return;
    // Which way the scroll unrolls is decided from where the trigger actually is: near the bottom
    // of the window a downward panel would open off-screen and the reader would have to scroll the
    // page to see what they just opened.
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const needed = Math.min(options.length * 44 + 16, 288) + 16;
      setDropUp(rect.bottom + needed > window.innerHeight && rect.top > needed);
    }
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }, [disabled, options.length, selectedIndex]);

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (option) onChange(option.value);
      close();
    },
    [options, onChange, close],
  );

  // A click anywhere else closes the panel, and does not steal the focus that click was aiming at
  // — hence `pointerdown` on the document rather than a blur handler on the trigger.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the highlighted option in view while the arrows walk past the edge of the list.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[activeIndex];
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  function moveTo(index: number): void {
    if (options.length === 0) return;
    const wrapped = (index + options.length) % options.length;
    setActiveIndex(wrapped);
  }

  function handleTypeAhead(key: string): boolean {
    if (key.length !== 1 || key === ' ') return false;
    const now = Date.now();
    typed.current.text = now - typed.current.at > TYPE_AHEAD_MS ? key : typed.current.text + key;
    typed.current.at = now;
    const needle = typed.current.text.toLocaleLowerCase();
    const found = options.findIndex((option) =>
      option.label.toLocaleLowerCase().startsWith(needle),
    );
    if (found < 0) return false;
    if (open) moveTo(found);
    else onChange(options[found]!.value);
    return true;
  }

  function onKeyDown(event: React.KeyboardEvent): void {
    if (disabled) return;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openPanel();
        return;
      }
      if (handleTypeAhead(event.key)) event.preventDefault();
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveTo(activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveTo(activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        moveTo(0);
        break;
      case 'End':
        event.preventDefault();
        moveTo(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        // Tab moves on rather than being trapped, and the panel closes behind it — but the focus
        // goes where Tab was going, not back to the trigger.
        close(false);
        break;
      default:
        if (handleTypeAhead(event.key)) event.preventDefault();
    }
  }

  return (
    <div
      ref={rootRef}
      className={cx(styles.root, block && styles.block, open && styles.open, className)}
    >
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        className={cx(
          styles.trigger,
          size === 'compact' && styles.compact,
          size === 'hero' && styles.hero,
          bare && styles.bare,
        )}
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openPanel())}
        onKeyDown={onKeyDown}
      >
        <span className={styles.label}>{selected?.label ?? placeholder ?? ''}</span>
        <Chevron />
      </button>

      <div
        className={cx(
          styles.panel,
          align === 'end' && styles.alignEnd,
          dropUp && styles.up,
          open && styles.panelOpen,
        )}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- `inert` lands in React 19;
            on 18 it must be spread as an attribute or React drops it silently. */}
        <div className={styles.clip} {...({ inert: open ? undefined : '' } as any)}>
          <ul
            ref={listRef}
            className={styles.list}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={cx(
                  styles.option,
                  index === activeIndex && styles.active,
                  option.value === value && styles.selected,
                )}
                style={{ ['--i' as string]: index }}
                // `pointerdown` rather than `click`: the document-level handler that closes the
                // panel also fires on pointerdown, and a click would arrive after it.
                onPointerDown={(event) => {
                  event.preventDefault();
                  commit(index);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span>{option.label}</span>
                <Check />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
