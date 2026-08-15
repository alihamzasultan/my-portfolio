'use client'

import { memo, useCallback, useRef } from 'react'
import Link from 'next/link'

export interface CarouselItem {
  id: number
  /** Canonical slug; falls back to id when absent. */
  slug?: string | null
  title: string
  description?: string
  tags?: string[]
  image?: string
  demo_video?: string
}

type Accent = 'blue' | 'cyan' | 'orange'

const accentTag: Record<Accent, string> = {
  blue: 'neo-tag-blue',
  cyan: 'neo-tag-cyan',
  orange: 'neo-tag-yellow',
}
const accentBtn: Record<Accent, string> = {
  blue: 'neo-btn-blue',
  cyan: 'neo-btn-cyan',
  orange: 'neo-btn-orange',
}
const accentFallback: Record<Accent, string> = {
  blue: 'bg-neo-blue',
  cyan: 'bg-neo-cyan',
  orange: 'bg-neo-orange',
}

const Card = memo(function Card({
  p,
  hrefBase,
  accent,
}: {
  p: CarouselItem
  hrefBase: string
  accent: Accent
}) {
  return (
    <Link href={`${hrefBase}/${p.slug || p.id}`} className="flex-shrink-0 w-72 sm:w-80">
      <div className="neo-card neo-interactive h-full flex flex-col overflow-hidden p-0">
        {p.image || p.demo_video ? (
          <div className="aspect-[1200/630] w-full overflow-hidden relative border-b-neo border-neo-border bg-[color:var(--neo-surface-2)]">
            <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
            {p.demo_video && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            )}
          </div>
        ) : (
          <div className={`h-44 ${accentFallback[accent]} border-b-neo border-neo-border flex items-center justify-center`}>
            <span className="text-center px-4 font-extrabold">{p.title}</span>
          </div>
        )}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-lg leading-snug break-words mb-2">{p.title}</h3>
            {p.description && (
              <p className="text-sm line-clamp-2 text-[color:var(--neo-ink-soft)]">{p.description}</p>
            )}
          </div>
          {p.tags && p.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className={`neo-tag ${accentTag[accent]} !text-[0.65rem]`}>{tag}</span>
              ))}
              {p.tags.length > 2 && (
                <span className="neo-tag !text-[0.65rem]">+{p.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
})

function ProjectCarousel({
  title,
  items,
  hrefBase,
  accent = 'blue',
}: {
  title: string
  items: CarouselItem[]
  hrefBase: string
  accent?: Accent
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const amount = 400
    const max = Math.max(0, el.scrollWidth - el.clientWidth)
    const target = direction === 'left' ? el.scrollLeft - amount : el.scrollLeft + amount
    el.scrollTo({ left: Math.min(max, Math.max(0, target)), behavior: 'smooth' })
  }, [])

  if (items.length === 0) return null

  return (
    <div className="mt-16 pt-10" style={{ borderTop: 'var(--neo-bw) solid var(--neo-border)' }}>
      <h2 className={`text-2xl font-extrabold mb-8 inline-block border-neo border-neo-border px-3 py-1.5 shadow-neo-sm -rotate-1 ${accentFallback[accent]}`}>
        {title}
      </h2>
      <div className="relative group">
        <div ref={trackRef} className="flex gap-6 overflow-x-auto pb-4 pt-3 pl-1 no-scrollbar">
          {items.map((p) => (
            <Card key={p.id} p={p} hrefBase={hrefBase} accent={accent} />
          ))}
        </div>
        <button
          onClick={() => scroll('left')}
          className={`neo-btn ${accentBtn[accent]} absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-11 h-11 !p-0 opacity-0 group-hover:opacity-100 transition z-10`}
          aria-label="Scroll left"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={() => scroll('right')}
          className={`neo-btn ${accentBtn[accent]} absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-11 h-11 !p-0 opacity-0 group-hover:opacity-100 transition z-10`}
          aria-label="Scroll right"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  )
}

export default memo(ProjectCarousel)
