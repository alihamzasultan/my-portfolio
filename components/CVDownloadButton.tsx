'use client'
import { profile } from '@/lib/profile'

import { memo, useState, useEffect } from 'react'

interface CVDownloadButtonProps {
  buttonSize?: 'lg' | 'sm'
  cvUrl?: string
}

function CVDownloadButton({ buttonSize = 'lg', cvUrl }: CVDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Download CV')

  useEffect(() => {
    if (!downloading) return

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 10
      setProgress(currentProgress)

      if (currentProgress < 30) {
        setStatusText(`PREPARING... [██░░░░░░░░] ${currentProgress}%`)
      } else if (currentProgress < 70) {
        setStatusText(`COMPRESSING... [█████░░░░░] ${currentProgress}%`)
      } else if (currentProgress < 100) {
        setStatusText(`SAVING... [████████░░] ${currentProgress}%`)
      } else {
        setStatusText(`COMPLETED! [██████████] 100%`)
        clearInterval(interval)

        // Trigger the actual file download
        const url = cvUrl || profile.cvPath
        window.open(url, '_blank', 'noopener,noreferrer')
        const a = document.createElement('a')
        a.href = url
        a.download = url.split('/').pop() || 'CV.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        // Reset state after a short delay
        setTimeout(() => {
          setDownloading(false)
          setProgress(0)
          setStatusText('Download CV')
        }, 1000)
      }
    }, 120)

    return () => clearInterval(interval)
  }, [downloading, cvUrl])

  const handleDownloadCV = () => {
    if (downloading) return
    setDownloading(true)
  }

  const spacebarStyles = downloading
    ? 'bg-neo-pink text-white animate-pulse cursor-wait translate-y-[6px] shadow-none'
    : 'bg-neo-yellow text-black shadow-[0_6px_0_var(--neo-border,#000)] hover:translate-y-[2px] hover:shadow-[0_4px_0_var(--neo-border,#000)] active:translate-y-[6px] active:shadow-none'

  return (
    <button
      onClick={handleDownloadCV}
      disabled={downloading}
      className={`w-full py-4 border-2 border-[color:var(--neo-border)] rounded-md text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-2 ${spacebarStyles}`}
      aria-label="Download CV"
    >
      {!downloading && (
        <svg
          className={buttonSize === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      {statusText}
    </button>
  )
}

export default memo(CVDownloadButton)
