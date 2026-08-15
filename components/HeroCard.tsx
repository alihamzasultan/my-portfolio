'use client'

import HeroTitle from './HeroSection'
import { useMouseTilt } from '@/lib/useMouseTilt'

interface HeroCardProps {
  badge: string
  headingPrefix: string
  headingHighlight: string
  description: string
}

export default function HeroCard({
  badge,
  headingPrefix,
  headingHighlight,
  description
}: HeroCardProps) {
  const { ref, style } = useMouseTilt(4)

  return (
    <div className="relative w-full group/hero-card overflow-visible py-6 px-3">
      {/* Dynamic Layer 1 (Pink cardboard backing) */}
      <div 
        className="absolute inset-0 mx-3 my-6 bg-neo-pink border-2 border-black rounded shadow-[4px_4px_0_#000] transition-all duration-300 ease-out -z-10 transform translate-x-[4px] translate-y-[4px] group-hover/hero-card:translate-x-[-14px] group-hover/hero-card:translate-y-[10px] group-hover/hero-card:rotate-[-4deg] origin-center" 
        aria-hidden="true"
      />

      {/* Dynamic Layer 2 (Yellow cardboard backing) */}
      <div 
        className="absolute inset-0 mx-3 my-6 bg-neo-yellow border-2 border-black rounded shadow-[6px_6px_0_#000] transition-all duration-300 ease-out -z-20 transform translate-x-[8px] translate-y-[8px] group-hover/hero-card:translate-x-[16px] group-hover/hero-card:translate-y-[-10px] group-hover/hero-card:rotate-[4deg] origin-center" 
        aria-hidden="true"
      />

      {/* Main interactive top sheet (Styled like a school notebook page) */}
      <div 
        ref={ref}
        className="relative z-10 w-full p-6 sm:p-8 md:p-10 flex flex-col bg-[color:var(--neo-surface)] border-2 border-black transition-transform duration-200 select-none overflow-hidden"
        style={style}
      >
        {/* Ruled lines background container */}
        <div 
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            backgroundImage: 'linear-gradient(var(--neo-border) 1px, transparent 1px)',
            backgroundSize: '100% 28px',
            opacity: 0.05,
          }}
        />
        {/* Tilted Yellow Sticky Note. Kept in normal flow rather than absolutely
            positioned: the badge text is author-supplied and can be long, so
            overlaying it would collide with the heading at some lengths. */}
        <div className="relative z-30 mb-6 flex justify-end pt-3 pr-1">
          <div className="relative max-w-full bg-[#fef08a] text-black border-2 border-black px-4 py-2.5 shadow-[4px_4px_0_#000] rotate-[-4deg] select-none pointer-events-none font-mono">
            {/* Metal Paperclip */}
            <div className="absolute -top-3.5 left-4 text-zinc-500 transform rotate-12">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-3.31 2.69-6 6-6s6 2.69 6 6v12.5c0 4.42-3.58 8-8 8s-8-3.58-8-8V6h2v11.5c0 3.31 2.69 6 6 6s6-2.69 6-6V5c0-2.21-1.79-4-4-4s-4 1.79-4 4v12.5c0 1.1.9 2 2 2s2-.9 2-2V6h2z"/>
              </svg>
            </div>
            <p className="text-base sm:text-lg font-black leading-tight uppercase tracking-wider px-1 text-balance">
              {badge}
            </p>
          </div>
        </div>

        {/* Notebook Red Margin Line */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-red-500/40 h-full flex flex-col justify-between">
          <div>
            <HeroTitle 
              headingPrefix={headingPrefix}
              headingHighlight={headingHighlight}
              description={description}
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <a href="#expertise" className="neo-btn neo-btn-pink min-h-[44px]" aria-label="Navigate to expertise section">
              Expertise
            </a>
            <a href="#projects" className="neo-btn neo-btn-blue min-h-[44px]" aria-label="Navigate to projects section">
              Projects
            </a>
            <a href="#experience" className="neo-btn neo-btn-lime min-h-[44px]" aria-label="Navigate to experience section">
              See Experience
            </a>
            <a href="#blogs" className="neo-btn neo-btn-yellow min-h-[44px]" aria-label="Navigate to blogs section">
              Blogs
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
