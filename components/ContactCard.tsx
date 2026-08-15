'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaEnvelope, FaGithub, FaLinkedin, FaMapMarkerAlt, FaPhoneAlt, FaCog, FaTimes, FaPlus, FaTrash, FaSave } from 'react-icons/fa'
import { SiMedium } from 'react-icons/si'
import { IoLogoTableau } from 'react-icons/io5'
import { FaXTwitter } from 'react-icons/fa6'
import CVDownloadButton from './CVDownloadButton'
import DateTimeWeather from './DateTimeWeather'
import { profile } from '@/lib/profile'

interface ProfileLink {
  label: string
  href: string
  icon: string
  displayText: string
}

const iconMap: Record<string, React.ReactNode> = {
  location: <FaMapMarkerAlt className="text-blue-300 light:text-blue-600" />,
  phone: <FaPhoneAlt />,
  email: <FaEnvelope />,
  github: <FaGithub />,
  linkedin: <FaLinkedin />,
  x: <FaXTwitter />,
  medium: <SiMedium />,
  tableau: <IoLogoTableau />,
}

const defaultLinks: ProfileLink[] = [
  { label: 'Location', href: '', icon: 'location', displayText: profile.location },
  { label: 'Phone Number', href: `tel:${profile.phone.replace(/\s+/g, '')}`, icon: 'phone', displayText: profile.phone },
  { label: 'Email', href: `mailto:${profile.email}`, icon: 'email', displayText: profile.email },
  profile.socialLinks.github ? { label: 'GitHub', href: profile.socialLinks.github, icon: 'github', displayText: profile.socialLinks.github.replace('https://', '') } : null,
  profile.socialLinks.linkedin ? { label: 'LinkedIn', href: profile.socialLinks.linkedin, icon: 'linkedin', displayText: profile.socialLinks.linkedin.replace('https://', '') } : null,
  profile.socialLinks.x ? { label: 'X', href: profile.socialLinks.x, icon: 'x', displayText: profile.socialLinks.x.replace('https://', '') } : null,
].filter(Boolean) as ProfileLink[]

interface ContactCardProps {
  initialLinks?: ProfileLink[]
  initialCvPath?: string
}

export default function ContactCard({ initialLinks, initialCvPath }: ContactCardProps) {
  const { data: session } = useSession()
  const isAdmin = !!session?.user?.email
  const showAdminControls = isAdmin

  const [editing, setEditing] = useState(false)
  const [links, setLinks] = useState<ProfileLink[]>(initialLinks && initialLinks.length > 0 ? initialLinks : defaultLinks)
  const [cvPath, setCvPath] = useState(initialCvPath || profile.cvPath)
  const [saving, setSaving] = useState(false)

  // Sync with server-provided data when it changes
  useEffect(() => {
    if (initialLinks && initialLinks.length > 0) {
      setLinks(initialLinks)
    }
    if (initialCvPath) {
      setCvPath(initialCvPath)
    }
  }, [initialLinks, initialCvPath])

  const updateLink = (index: number, field: keyof ProfileLink, value: string) => {
    setLinks(prev => prev.map((link, i) => i === index ? { ...link, [field]: value } : link))
  }

  const addLink = () => {
    setLinks(prev => [...prev, { label: '', href: '', icon: 'email', displayText: '' }])
  }

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'contact',
          cards: [
            {
              card_data: { links, cvPath },
              sort_order: 0,
            },
          ],
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setEditing(false)
    } catch (err) {
      console.error('Error saving contact card:', err)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const locationLink = links.find(l => l.icon === 'location') || { displayText: profile.location }
  const phoneLink = links.find(l => l.icon === 'phone') || { displayText: profile.phone, href: `tel:${profile.phone.replace(/\s+/g, '')}` }
  const emailLink = links.find(l => l.icon === 'email') || { displayText: profile.email, href: `mailto:${profile.email}` }
  let emailHref = emailLink.href
  if (emailHref && emailHref.startsWith('mailto:')) {
    const emailAddress = emailHref.replace('mailto:', '')
    emailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}`
  } else if (!emailHref) {
    emailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}`
  }

  // Extract remaining social link keycaps
  const socialLinks = links.filter(l => !['location', 'phone', 'email'].includes(l.icon))


  return (
    <div 
      id="contact-card" 
      className="relative w-full overflow-visible py-4 flex flex-col items-center select-none"
    >
      {/* 1. Laptop Lid / Screen */}
      <div className="relative w-[95%] sm:w-[90%] min-h-[460px] sm:min-h-[500px] bg-zinc-800 dark:bg-zinc-700 border-4 border-black rounded-t-2xl shadow-[6px_0_0_#000] flex flex-col overflow-hidden z-10">
          
          {/* Screen Bezel Frame */}
          <div className="p-3 sm:p-4 bg-zinc-900 border-b-4 border-black flex flex-col flex-1 relative">
            {/* Webcam dot */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zinc-800 border border-black/40" />

            {/* CRT Screen Display Content */}
            <div className="bg-[color:var(--neo-surface)] text-[color:var(--neo-ink)] p-3 sm:p-4 rounded border-2 border-black flex flex-col flex-1 font-mono overflow-y-auto text-xs relative select-text min-h-[400px] sm:min-h-[440px] scrollbar-thin">
              
              {/* Terminal Top Window Bar */}
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2 mb-3 text-[10px] sm:text-xs select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                </div>
                <span className="text-zinc-500 dark:text-zinc-400 font-bold">contact_info.sh</span>
                {showAdminControls ? (
                  <button
                    onClick={() => setEditing(!editing)}
                    className="text-zinc-500 hover:text-neo-pink transition-colors p-0.5"
                    aria-label={editing ? 'Close editor' : 'Edit contact card'}
                  >
                    {editing ? <FaTimes className="w-3.5 h-3.5" /> : <FaCog className="w-3.5 h-3.5" />}
                  </button>
                ) : (
                  <div className="w-4" />
                )}
              </div>

              {editing ? (
                <div className="space-y-4 flex-1 text-black dark:text-white select-text">
                  {links.map((link, idx) => (
                    <div key={idx} className="neo-panel p-3 space-y-2 border-2 border-black bg-[color:var(--neo-surface)]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-current">Link #{idx + 1}</span>
                        <button onClick={() => removeLink(idx)} className="neo-btn neo-btn-red w-8 h-8 !p-0 border-2 border-black shadow-[2px_2px_0_#000] active:translate-y-[2px] active:shadow-none">
                          <FaTrash className="w-3 h-3 text-black" />
                        </button>
                      </div>
                      <input type="text" value={link.label} onChange={(e) => updateLink(idx, 'label', e.target.value)} placeholder="Label (e.g. GitHub)" className="neo-input !py-1.5 text-sm border-2 border-black bg-[color:var(--neo-surface)] text-current" />
                      <input type="text" value={link.href} onChange={(e) => updateLink(idx, 'href', e.target.value)} placeholder="URL (e.g. https://github.com/user)" className="neo-input !py-1.5 text-sm border-2 border-black bg-[color:var(--neo-surface)] text-current" />
                      <input type="text" value={link.displayText} onChange={(e) => updateLink(idx, 'displayText', e.target.value)} placeholder="Display text (e.g. github.com/user)" className="neo-input !py-1.5 text-sm border-2 border-black bg-[color:var(--neo-surface)] text-current" />
                      <select value={link.icon} onChange={(e) => updateLink(idx, 'icon', e.target.value)} className="neo-select !py-1.5 text-sm border-2 border-black bg-[color:var(--neo-surface)] text-current">
                        {Object.keys(iconMap).map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <button onClick={addLink} className="neo-btn neo-btn-lime w-full py-2 text-sm border-2 border-black shadow-[4px_4px_0_#000] text-black">
                    <FaPlus className="w-3 h-3 inline mr-1" /> Add New Link
                  </button>

                  <div className="neo-panel p-3 space-y-2 border-2 border-black bg-[color:var(--neo-surface)]">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-current">CV Download Path</span>
                    <input type="text" value={cvPath} onChange={(e) => setCvPath(e.target.value)} placeholder={profile.cvPath} className="neo-input !py-1.5 text-sm border-2 border-black bg-[color:var(--neo-surface)] text-current" />
                  </div>

                  <button onClick={handleSave} disabled={saving} className="neo-btn neo-btn-cyan w-full py-2 text-sm border-2 border-black shadow-[4px_4px_0_#000] text-black">
                    <FaSave className="w-3 h-3 inline mr-1" /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col flex-1">
                  {/* Console welcome */}
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-4 select-none">
                    {profile.name.split(" ")[0]}-OS v1.5.0 (tty1)<br/>
                    System online. Executing terminal query...
                  </div>

                  {/* Location Prompt */}
                  <div className="mb-3">
                    <div className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs select-none">$ get --location</div>
                    <div className="flex items-center gap-2 text-[color:var(--neo-ink)] font-bold bg-[color:var(--neo-bg-alt)] border-2 border-black px-3 py-1.5 rounded w-fit text-[11px] sm:text-xs mt-1 shadow-[2px_2px_0_#000]">
                      <FaMapMarkerAlt className="text-neo-blue w-3.5 h-3.5" />
                      <span>{locationLink.displayText}</span>
                    </div>
                  </div>

                  {/* Phone Prompt */}
                  <div className="mb-3">
                    <div className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs select-none">$ get --phone</div>
                    <div className="flex items-center gap-2 text-[color:var(--neo-ink)] font-bold bg-[color:var(--neo-bg-alt)] border-2 border-black px-3 py-1.5 rounded w-fit text-[11px] sm:text-xs mt-1 shadow-[2px_2px_0_#000]">
                      <FaPhoneAlt className="text-neo-yellow w-3.5 h-3.5" />
                      {phoneLink.href ? (
                        <a href={phoneLink.href} className="hover:underline transition-colors">{phoneLink.displayText}</a>
                      ) : (
                        <span>{phoneLink.displayText}</span>
                      )}
                    </div>
                  </div>

                  {/* Email Prompt */}
                  <div className="mb-4">
                    <div className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs select-none">$ mail --compose</div>
                    <a 
                      href={emailHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-black font-bold bg-neo-pink border-2 border-black px-3 py-2 rounded hover:translate-y-[-1px] hover:shadow-[3px_3px_0_#000] active:translate-y-[1px] active:shadow-none transition-all duration-150 w-full text-[11px] sm:text-xs mt-1 shadow-[2px_2px_0_#000]"
                    >
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="w-3.5 h-3.5 text-black" />
                        <span>{emailLink.displayText}</span>
                      </div>
                      <span className="text-[10px] text-black">Launch Mail ➔</span>
                    </a>
                  </div>

                  {/* Social Commands */}
                  <div className="mb-4">
                    <div className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs select-none">$ cat profile_links.txt</div>
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      {socialLinks.map((link, idx) => {
                        const btnColors: Record<string, string> = {
                          github: 'bg-neo-lime text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-neo-lime/90',
                          linkedin: 'bg-neo-blue text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-neo-blue/90',
                          x: 'bg-neo-cyan text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-neo-cyan/90',
                          medium: 'bg-neo-pink text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-neo-pink/90',
                          tableau: 'bg-neo-yellow text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-neo-yellow/90',
                        }
                        const btnColor = btnColors[link.icon] || 'bg-neo-pink text-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-neo-pink/90'
                        const linkIcon = iconMap[link.icon]
                        return (
                          <a 
                            key={idx}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center w-9 h-9 rounded transition-all duration-150 hover:translate-y-[-1.5px] hover:shadow-[3px_3px_0_#000] active:translate-y-[1px] active:shadow-none ${btnColor}`}
                            aria-label={link.label}
                            title={link.label}
                          >
                            {linkIcon && <span className="w-5 h-5 flex items-center justify-center text-lg [&>svg]:w-full [&>svg]:h-full">{linkIcon}</span>}
                          </a>
                        )
                      })}
                    </div>
                  </div>

                  {/* Fetch CV Command */}
                  <div className="mb-4">
                    <div className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs select-none">$ fetch --cv</div>
                    <div className="mt-1 shadow-[4px_4px_0_#000] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_#000] active:translate-y-[1px] active:shadow-none transition-all rounded">
                      <CVDownloadButton buttonSize="sm" cvUrl={cvPath} />
                    </div>
                  </div>

                  {/* LCD Weather Status Output */}
                  <div className="mt-auto border-t border-black/10 dark:border-white/10 pt-2 flex items-center justify-between text-[10px] sm:text-xs text-[color:var(--neo-ink)] select-none">
                    <DateTimeWeather />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. The Keyboard Base Hinge */}
        <div className="relative w-[102%] h-6 bg-zinc-300 dark:bg-zinc-600 border-4 border-black rounded-b-2xl shadow-[0_8px_0_#000] z-20 flex flex-col justify-between">
          {/* Keyboard recess keywell bar */}
          <div className="mx-auto w-4/5 h-2.5 bg-zinc-800 dark:bg-zinc-900 border-2 border-black rounded mt-0.5" />
          {/* Trackpad */}
          <div className="mx-auto w-16 h-2 bg-zinc-400 dark:bg-zinc-500 border-x-2 border-t-2 border-black rounded-t-sm" />
        </div>
    </div>
  )
}
