'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/** The inner loader visual (logo + bouncing 6-colour blocks). Reusable. */
export function NeoLoaderVisual() {
  return (
    <div className="relative flex flex-col items-center gap-7">
      <div className="neo-card neo-card-alt w-20 h-20 p-2 flex items-center justify-center -rotate-2">
        <img src="/favicon.svg?v=3" alt="" width={64} height={64} className="w-full h-full object-contain" />
      </div>
      {/* The blocks carry the loading signal on their own — no text label. */}
      <div className="neo-loader">
        <span style={{ background: 'var(--neo-blue)' }} />
        <span style={{ background: 'var(--neo-cyan)' }} />
        <span style={{ background: 'var(--neo-orange)' }} />
        <span style={{ background: 'var(--neo-lime)' }} />
        <span style={{ background: 'var(--neo-yellow)' }} />
        <span style={{ background: 'var(--neo-pink)' }} />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}

/**
 * Full-screen loader PORTALED to <body>. Used by in-`main` loaders (route
 * loading.tsx, project detail pages) so the overlay escapes main's
 * `relative z-10` stacking context and covers the fixed header.
 */
export default function NeoLoader() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const content = (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center"
      style={{ background: 'var(--neo-bg)' }}
      aria-label="Loading"
      role="status"
    >
      <NeoLoaderVisual />
    </div>
  )

  if (!mounted) return null
  return createPortal(content, document.body)
}
