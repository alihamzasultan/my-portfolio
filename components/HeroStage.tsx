import Link from 'next/link'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import Typewriter from './Typewriter'
import { profile } from '@/lib/profile'

interface HeroStageProps {
  name?: string
  greeting?: string
  status?: string
  typewriterSentences: string[]
  socialLinks?: {
    github?: string
    linkedin?: string
    x?: string
    email?: string
  }
  chips?: { label: string; icon: string; color: string }[]
}

/**
 * Splits a full name into a first line and a highlighted remainder,
 * e.g. "Ali Hamza Sultan" -> ["ALI", "HAMZA SULTAN"].
 */
function splitName(fullName: string): [string, string] {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return [parts[0].toUpperCase(), '']
  return [parts[0].toUpperCase(), parts.slice(1).join(' ').toUpperCase()]
}

const defaultChips = [
  { label: '2026', icon: '🚀', color: 'var(--neo-cyan)' },
  { label: 'ML Systems', icon: '⚡', color: 'var(--neo-lime)' },
  { label: 'LLMs', icon: '🧠', color: 'var(--neo-purple)' },
]

/**
 * Decoration slots for the scattered ornaments.
 *
 * Ornaments are anchored to the edges of the centre column rather than to the
 * viewport, so the gap to the text stays constant instead of stretching open on
 * wide monitors. `side` picks which edge to hang from; `gap` is the distance
 * outward from that edge.
 *
 * The ornaments sit in two concentric rings: the larger social tiles hug the
 * text, and the small chips sit further out. Because the rings are separated
 * horizontally, a chip and a tile may share a similar vertical slot without
 * colliding. Rendered at xl and up, where the gutters are wide enough:
 * at 1280px the gutter is 304px, and the outer ring ends at ~260px.
 */

/** Outer ring: small skill chips, furthest from the text. */
const CHIP_SLOTS = [
  { side: 'left', top: '10%', rotate: -6 },
  { side: 'left', top: '72%', rotate: 5 },
  { side: 'right', top: '72%', rotate: -5 },
] as const

/** Inner ring: the larger social tiles, tucked in beside the name. */
const TILE_SLOTS = [
  { side: 'left', top: '20%', rotate: -15 },
  { side: 'right', top: '12%', rotate: 8 },
  { side: 'left', top: '66%', rotate: -38 },
  { side: 'right', top: '64%', rotate: 12 },
] as const

/**
 * Distance of each ring outward from the centre column's edge.
 *
 * The chip ring has to clear the *rotated* bounding box of a tile, not its
 * 96px square: at -38deg that box is 96*(cos38+sin38) ~= 135px, so the tile
 * reaches ~131px out. 9.5rem (152px) keeps the rings apart with margin left.
 */
const TILE_GAP = '1rem'
const CHIP_GAP = '9.5rem'

/** Hangs an ornament `gap` outside the given edge of the centre column. */
function anchor(side: 'left' | 'right', gap: string) {
  return side === 'left'
    ? { right: `calc(100% + ${gap})` }
    : { left: `calc(100% + ${gap})` }
}

export default function HeroStage({
  name = profile.name,
  greeting = 'HELLO WORLD 👋',
  status = 'OPEN TO WORK',
  typewriterSentences,
  socialLinks,
  chips = defaultChips,
}: HeroStageProps) {
  const [firstName, lastName] = splitName(name)

  const links = {
    github: socialLinks?.github ?? profile.socialLinks.github,
    linkedin: socialLinks?.linkedin ?? profile.socialLinks.linkedin,
    x: socialLinks?.x ?? profile.socialLinks.x,
    email: socialLinks?.email ?? `mailto:${profile.email}`,
  }

  // Floating social tiles. Slots are assigned after filtering so that a missing
  // link closes the gap rather than leaving a hole in the scatter.
  const socialTiles = [
    {
      key: 'github',
      href: links.github,
      label: 'GITHUB',
      icon: <FaGithub />,
      className: 'bg-[#18181b] text-white',
    },
    {
      key: 'linkedin',
      href: links.linkedin,
      label: 'LINKEDIN',
      icon: <FaLinkedin />,
      className: 'bg-[#0a66c2] text-white',
    },
    {
      key: 'email',
      href: links.email,
      label: 'EMAIL',
      icon: <FaEnvelope />,
      className: 'bg-neo-yellow text-black',
    },
    {
      key: 'x',
      href: links.x,
      label: 'X',
      icon: <FaXTwitter />,
      className: 'bg-[#18181b] text-white',
    },
  ]
    .filter((tile) => Boolean(tile.href))
    .map((tile, i) => ({ ...tile, slot: TILE_SLOTS[i % TILE_SLOTS.length] }))

  // Full-bleed: the page wrapper is a padded max-w-6xl column, so the stage
  // breaks out of it to run the grid edge-to-edge. The negative top margin
  // cancels that wrapper's top padding so the hero meets the header.
  return (
    <section
      id="hero"
      aria-label="Welcome section"
      className="relative isolate -mt-10 ml-[calc(50%-50vw)] w-screen overflow-hidden border-b-2 border-[color:var(--neo-border)] px-4 pt-2 pb-12 sm:-mt-12 lg:pt-4 lg:pb-16 xl:min-h-[540px]"
    >
      {/* Graph-paper grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.09]"
        style={{
          backgroundImage:
            'linear-gradient(var(--neo-border) 1px, transparent 1px), linear-gradient(90deg, var(--neo-border) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />

      {/* Scattered decorations — xl and above, where the side gutters are wide
          enough to hold them clear of the centre column. Purely ornamental.
          The inner wrapper mirrors the centre column's width so the ornaments
          can hang off its edges at a fixed distance. */}
      <div className="pointer-events-none absolute inset-0 -z-[5] hidden xl:block">
        <div className="relative mx-auto h-full max-w-2xl">
          {chips.map((chip, i) => {
            const slot = CHIP_SLOTS[i % CHIP_SLOTS.length]
            return (
              <span
                key={chip.label}
                aria-hidden="true"
                className="absolute inline-flex items-center gap-2 whitespace-nowrap border-2 border-black px-3 py-2 font-mono text-sm font-bold text-black shadow-[4px_4px_0_#000]"
                style={{
                  background: chip.color,
                  top: slot.top,
                  transform: `rotate(${slot.rotate}deg)`,
                  ...anchor(slot.side, CHIP_GAP),
                }}
              >
                <span aria-hidden="true">{chip.icon}</span>
                {chip.label}
              </span>
            )
          })}

          {/* Status flag — sits above the top-right tile slot */}
          <span
            aria-hidden="true"
            className="absolute inline-flex rotate-[-8deg] items-center gap-2 whitespace-nowrap border-2 border-black bg-neo-pink px-4 py-2 font-mono text-xs font-black uppercase tracking-widest text-black shadow-[5px_5px_0_#000]"
            style={{ ...anchor('right', CHIP_GAP), top: '14%' }}
          >
            <span className="h-2 w-2 rounded-full bg-black" />
            {status}
          </span>

          {/* Floating social tiles */}
          {socialTiles.map((tile) => (
            <a
              key={tile.key}
              href={tile.href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              aria-hidden="true"
              className={`pointer-events-auto absolute flex h-24 w-24 flex-col items-center justify-center gap-1 border-2 border-black shadow-[5px_5px_0_#000] transition-transform duration-200 hover:-translate-y-1 ${tile.className}`}
              style={{
                top: tile.slot.top,
                transform: `rotate(${tile.slot.rotate}deg)`,
                ...anchor(tile.slot.side, TILE_GAP),
              }}
            >
              <span className="text-2xl">{tile.icon}</span>
              <span className="font-mono text-[9px] font-bold tracking-widest">{tile.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Center column */}
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
        {/* Greeting pill */}
        <div className="mb-6 flex items-center gap-3">
          <span className="h-3 w-3 shrink-0 rounded-full border-2 border-black bg-neo-lime" aria-hidden="true" />
          <span className="border-2 border-black bg-[color:var(--neo-surface)] px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--neo-ink)] shadow-[4px_4px_0_#000]">
            {greeting}
          </span>
        </div>

        {/* Name */}
        <h1 className="mb-8 flex flex-col items-center gap-3 font-[family-name:var(--font-anton)] font-normal uppercase leading-[0.9] tracking-[0.06em]">
          <span className="text-6xl text-[color:var(--neo-ink)] sm:text-7xl lg:text-8xl">
            {firstName}
          </span>
          {lastName && (
            <span className="inline-block -rotate-[1.5deg] border-2 border-black bg-neo-yellow px-6 py-3 text-5xl text-black shadow-[8px_8px_0_#000] sm:text-6xl lg:text-7xl">
              {lastName}
            </span>
          )}
        </h1>

        {/* Terminal-style typewriter */}
        <Typewriter
          variant="terminal"
          sentences={typewriterSentences}
          typingSpeed={80}
          deletingSpeed={40}
          pauseDuration={2500}
        />

        {/* Calls to action */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="#projects" className="neo-btn neo-btn-ink min-h-[44px] gap-2 text-base">
            <span aria-hidden="true">🚀</span> View Projects
          </Link>
          <Link href="#contact" className="neo-btn neo-btn-yellow min-h-[44px] gap-2 text-base">
            <span aria-hidden="true">💬</span> Let&apos;s Talk
          </Link>
        </div>

        {/* Mobile/tablet fallback for the floating tiles */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 xl:hidden">
          {socialTiles.map((tile) => (
            <a
              key={tile.key}
              href={tile.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tile.label}
              className={`flex h-14 w-14 items-center justify-center border-2 border-black text-xl shadow-[4px_4px_0_#000] ${tile.className}`}
            >
              {tile.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
