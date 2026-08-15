'use client'

import { memo } from 'react'
import type { IconType } from 'react-icons'
import { getTagIcon } from '@/lib/techIcons'
import { iconRegistry } from '@/lib/iconRegistry'
import SvgIcon from './icons/SvgIcon'

interface TagBadgeProps {
  tag: string
  /**
   * `auto` derives a stable colour from the tag name so each technology keeps
   * the same colour everywhere it appears. `terminal` is the dark, outlined
   * chip used on dark panels.
   */
  variant?: 'blue' | 'pink' | 'yellow' | 'gray' | 'green' | 'terminal' | 'auto'
}

// Palette used by the `auto` variant. All of these take black text legibly.
const AUTO_COLORS = [
  'neo-tag-blue',
  'neo-tag-pink',
  'neo-tag-lime',
  'neo-tag-yellow',
  'neo-tag-cyan',
  'neo-tag-purple',
  'neo-tag-orange',
]

/** Stable string hash so a given tag always lands on the same colour. */
function hashTag(tag: string): number {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0
  return h
}

function TagBadge({ tag, variant = 'blue' }: TagBadgeProps) {
  const iconData = getTagIcon(tag)
  const isTerminal = variant === 'terminal'

  // Map legacy variants onto the neubrutalism flat-block tag colors
  const variantClass: Record<string, string> = {
    blue: 'neo-tag-blue',
    pink: 'neo-tag-pink',
    yellow: 'neo-tag-yellow',
    green: 'neo-tag-lime',
    gray: 'neo-tag-cyan',
  }

  // Flat blocks put icons in solid ink for contrast; the terminal chip keeps
  // each technology's own brand colour against the dark fill.
  const iconColor = isTerminal ? iconData?.color || '#d4d4d8' : '#111111'

  let IconComponent: IconType | null = null
  let isSvgIcon = false
  let svgIconName = ''

  if (iconData) {
    const [iconPackage, iconName] = iconData.icon.split('/')
    if (iconPackage === 'svg') {
      isSvgIcon = true
      svgIconName = iconName
    } else {
      IconComponent = iconRegistry[iconData.icon] || null
    }
  }

  const colorClass =
    variant === 'auto'
      ? AUTO_COLORS[hashTag(tag.toLowerCase()) % AUTO_COLORS.length]
      : variantClass[variant]

  const className = isTerminal
    ? 'inline-flex items-center gap-2 border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 font-mono text-xs text-zinc-300'
    : `neo-tag ${colorClass}`

  return (
    <span className={className}>
      {isSvgIcon && svgIconName && (
        <SvgIcon name={svgIconName} className="w-4 h-4 flex-shrink-0" style={{ color: iconColor }} />
      )}
      {IconComponent && (
        <IconComponent className="w-4 h-4 flex-shrink-0" style={{ color: iconColor }} />
      )}
      {tag}
    </span>
  )
}

export default memo(TagBadge)
