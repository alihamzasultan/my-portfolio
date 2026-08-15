'use client'
import { memo, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'

// Each nav item is its own bordered tile with a hard offset shadow, so it stays
// legible against whatever scrolls beneath the transparent header.
const navLink =
  'whitespace-nowrap font-bold text-[color:var(--neo-ink)] bg-[color:var(--neo-surface)] px-4 py-2 border-2 border-neo-border shadow-[3px_3px_0_var(--neo-shadow)] hover:bg-neo-yellow hover:text-black hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0_var(--neo-shadow)] transition-all duration-100'

// `section` is the element id the scroll-spy watches; items without one (the
// standalone Blogs page) are highlighted by pathname instead.
const NAV_ITEMS = [
  { label: 'About', href: '/#about', section: 'about' },
  { label: 'Expertise', href: '/#expertise', section: 'expertise' },
  { label: 'Projects', href: '/#projects', section: 'projects' },
  { label: 'Experience', href: '/#experience', section: 'experience' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Contact', href: '/#contact', section: 'contact' },
]

const navLinkActive =
  'whitespace-nowrap font-bold px-4 py-2 border-2 border-neo-border shadow-[3px_3px_0_var(--neo-shadow)] bg-neo-yellow text-black -translate-y-0.5 transition-all duration-100'

/**
 * Highlights the nav item whose section is currently in view.
 *
 * Uses IntersectionObserver with a top margin equal to the fixed header height,
 * so a section counts as "current" once it clears the header rather than when
 * it first touches the viewport edge.
 */
function useActiveSection(enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    const ids = NAV_ITEMS.map((i) => i.section).filter(Boolean) as string[]
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n))
    if (!nodes.length) return

    const visible = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio)
          else visible.delete(entry.target.id)
        }
        // Pick the section nearest the top of those currently on screen.
        const onScreen = ids.filter((id) => visible.has(id))
        setActive(onScreen.length ? onScreen[0] : null)
      },
      { rootMargin: '-96px 0px -55% 0px', threshold: [0, 0.15, 0.5] }
    )

    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [enabled])

  return active
}


function HeaderComponent() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const isAdmin = session?.user?.email
  const isAdminPage = pathname.startsWith('/console')
  const isHome = pathname === '/'
  const activeSection = useActiveSection(isHome)

  /** A nav item is current if its section is in view, or its page is open. */
  const isCurrent = (item: (typeof NAV_ITEMS)[number]) =>
    item.section ? isHome && activeSection === item.section : pathname.startsWith(item.href)

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="neo-btn neo-btn-cyan w-10 h-10 !p-0"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  )

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-12 py-4 flex justify-between items-center gap-6">
        <Link
          href={isAdminPage ? '/' : '/#top'}
          onClick={() => setMenuOpen(false)}
          className="mr-4 lg:mr-10 shrink-0 hover:-translate-y-0.5 transition-transform duration-100"
        >
          <span className="block bg-neo-yellow text-black px-5 py-2.5 border-2 border-neo-border shadow-[5px_5px_0_var(--neo-shadow)] font-mono text-xl sm:text-2xl font-black uppercase tracking-wider">
            Portfolio
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          {isAdmin && isAdminPage ? (
            <>
              <span className="font-extrabold text-xs bg-neo-pink border-2 border-neo-border px-2.5 py-1.5 uppercase tracking-widest -rotate-1 text-black shadow-neo-sm mr-2">
                Console Mode
              </span>
              <Link href="/" className={navLink}>Public View</Link>
            </>
          ) : (
            NAV_ITEMS.map((item) => {
              const current = isCurrent(item)
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={current ? navLinkActive : navLink}
                  aria-current={current ? 'page' : undefined}
                >
                  {item.label}
                </a>
              )
            })
          )}

          <ThemeToggle />

          {isAdmin && (
            <>
              {!isAdminPage && (
                <Link href="/console" className="neo-btn neo-btn-purple px-3 py-2 text-sm whitespace-nowrap">Console</Link>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })} className="neo-btn neo-btn-red px-3 py-2 text-sm whitespace-nowrap">
                Sign Out
              </button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="neo-btn neo-btn-pink w-10 h-10 !p-0 relative"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded bg-black transition-all duration-200 ${menuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
            <span className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded bg-black transition-all duration-200 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded bg-black transition-all duration-200 ${menuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed left-0 top-[84px] w-full transition-all duration-300 ease-in-out overflow-hidden ${
          menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ background: 'var(--neo-surface)', borderBottom: menuOpen ? 'var(--neo-bw) solid var(--neo-border)' : 'none' }}
      >
        <nav className="flex flex-col gap-3 p-6">
          {isAdmin && isAdminPage ? (
            <>
              <div className="flex justify-center py-1">
                <span className="font-extrabold text-xs bg-neo-pink border-2 border-neo-border px-3 py-1.5 uppercase tracking-widest text-black shadow-neo-sm">
                  Console Mode
                </span>
              </div>
              <Link href="/" onClick={() => setMenuOpen(false)} className={navLink}>Public View</Link>
            </>
          ) : (
            NAV_ITEMS.map((item) => {
              const current = isCurrent(item)
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={current ? navLinkActive : navLink}
                  aria-current={current ? 'page' : undefined}
                >
                  {item.label}
                </a>
              )
            })
          )}

          {isAdmin && (
            <>
              {!isAdminPage && (
                <Link href="/console" onClick={() => setMenuOpen(false)} className="neo-btn neo-btn-purple py-2 text-sm">Console</Link>
              )}
              <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }} className="neo-btn neo-btn-red py-2 text-sm">Sign Out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default memo(HeaderComponent)
