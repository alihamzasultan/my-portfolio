'use client'
import { memo } from 'react'

interface HeroTitleProps {
  badge?: string
  headingPrefix?: string
  headingHighlight?: string
  description: string
}

function HeroTitle({
  headingPrefix = 'Welcome to my',
  headingHighlight = 'Portfolio',
  description
}: HeroTitleProps) {
  return (
    <>
      <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-[1.05]">
        {headingPrefix}{' '}
        <span className="bg-neo-yellow px-2 border-neo border-neo-border shadow-neo-sm inline-block -rotate-1 text-black">
          {headingHighlight}
        </span>
      </h2>
      <p className="text-base md:text-lg text-[color:var(--neo-ink-soft)] font-medium mb-8 leading-relaxed">
        {description}
      </p>
    </>
  )
}

export default memo(HeroTitle)
