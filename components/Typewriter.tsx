'use client'

import { useState, useEffect } from 'react'

interface TypewriterProps {
  sentences: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  /**
   * 'card' (default) renders the rotated colour-cycling card used historically.
   * 'terminal' renders a white bordered console box with a `>` prompt, and uses
   * a <p> rather than an <h1> so it can sit under a real page heading.
   */
  variant?: 'card' | 'terminal'
}

// The 6 section colors
const SECTION_COLORS = [
  'var(--neo-blue)',
  'var(--neo-cyan)',
  'var(--neo-orange)',
  'var(--neo-lime)',
  'var(--neo-yellow)',
  'var(--neo-pink)',
]

export default function Typewriter({
  sentences,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  variant = 'card',
}: TypewriterProps) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [bgColor, setBgColor] = useState(SECTION_COLORS[0])

  // Pick a random section color whenever the sentence changes
  useEffect(() => {
    setBgColor(SECTION_COLORS[Math.floor(Math.random() * SECTION_COLORS.length)])
  }, [currentSentenceIndex])

  useEffect(() => {
    const currentSentence = sentences[currentSentenceIndex]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < currentSentence.length) {
          setCurrentText(currentSentence.substring(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration)
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentSentence.substring(0, currentText.length - 1))
        } else {
          setIsDeleting(false)
          setCurrentSentenceIndex((prev) => (prev + 1) % sentences.length)
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentSentenceIndex, sentences, typingSpeed, deletingSpeed, pauseDuration])

  if (variant === 'terminal') {
    return (
      <div className="flex w-full justify-center">
        <div className="inline-block max-w-full border-2 border-black bg-[color:var(--neo-surface)] px-5 py-4 shadow-[6px_6px_0_#000] sm:px-7">
          <p className="min-h-[2.5rem] break-words font-mono text-lg font-bold leading-snug text-[color:var(--neo-ink)] sm:text-2xl md:text-3xl">
            <span className="mr-2 text-[color:var(--neo-ink-soft)]" aria-hidden="true">
              &gt;
            </span>
            {currentText}
            <span className="neo-caret" />
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-12 flex justify-center">
      <div
        className="neo-card inline-block px-5 sm:px-6 py-5 -rotate-1 max-w-full"
        style={{ background: bgColor, transition: 'background 350ms ease' }}
      >
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold min-h-[3.5rem] text-[#111] leading-snug break-words font-mono">
          {currentText}
          <span className="neo-caret" />
        </h1>
      </div>
    </div>
  )
}
