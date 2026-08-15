import Link from 'next/link'

interface SectionHeadingProps {
  /** Zero-padded section index, e.g. "02". */
  index: string
  /** Small uppercase label shown inside the bracketed box. */
  label: string
  /** Large display title rendered in the condensed display face. */
  title: string
  /** Optional accent note pinned to the right on wide screens. */
  tag?: string
  /** When set, the accent note renders as a link to this href. */
  tagHref?: string
  /** `dark` inverts the palette for sections that sit on a dark panel. */
  tone?: 'light' | 'dark'
}

/**
 * Shared section header: a bracketed monospace index box above a large
 * condensed title, with an optional accent tag on the right.
 */
export default function SectionHeading({
  index,
  label,
  title,
  tag,
  tagHref,
  tone = 'light',
}: SectionHeadingProps) {
  const isDark = tone === 'dark'
  const tagClass =
    'inline-flex shrink-0 -rotate-1 items-center gap-2 self-start border-2 border-black bg-neo-yellow px-5 py-2.5 font-mono text-sm font-bold text-black shadow-[5px_5px_0_#000] sm:self-end'

  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span
          className={`inline-block border-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-[0.2em] ${
            isDark
              ? 'border-neo-yellow text-[color:var(--neo-yellow)]'
              : 'border-neo-border text-[color:var(--neo-ink)]'
          }`}
        >
          [ {index} — {label} ]
        </span>
        {/* Deliberately NOT the Anton display face — that is reserved for the
            hero name so the heavy treatment stays a single accent rather than
            the default for every heading on the page. */}
        <h2
          className={`mt-4 text-4xl font-extrabold uppercase leading-[1] tracking-tight sm:text-5xl ${
            isDark ? 'text-white' : 'text-[color:var(--neo-ink)]'
          }`}
        >
          {title}
        </h2>
      </div>

      {tag &&
        (tagHref ? (
          <Link
            href={tagHref}
            className={`${tagClass} transition-transform duration-100 hover:-translate-y-0.5`}
          >
            {tag}
          </Link>
        ) : (
          <span className={tagClass}>{tag}</span>
        ))}
    </div>
  )
}
