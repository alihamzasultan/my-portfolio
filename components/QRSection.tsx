'use client'
import { profile } from '@/lib/profile'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaCog, FaTimes, FaSave } from 'react-icons/fa'
import WhatsAppButton from './WhatsAppButton'
import AnimatedTechCards from './AnimatedTechCards'

interface QRCard {
  label: string
  imageSrc: string
  borderColor: string
  textColor: string
  buttonType: 'cv' | 'whatsapp'
  linkUrl: string
}

const defaultCards: QRCard[] = [
  {
    label: 'CV QR Code',
    imageSrc: '/qr_code/CV.svg',
    borderColor: 'cyan',
    textColor: 'cyan',
    buttonType: 'cv',
    linkUrl: profile.cvPath,
  },
  {
    label: 'WhatsApp QR Code',
    imageSrc: '/qr_code/WhatsApp.svg',
    borderColor: 'purple',
    textColor: 'purple',
    buttonType: 'whatsapp',
    linkUrl: 'https://wa.me/919217036208',
  },
]

const headerColorMap: Record<string, string> = {
  cyan: 'bg-neo-cyan',
  purple: 'bg-neo-purple',
  yellow: 'bg-neo-yellow',
  pink: 'bg-neo-pink',
}

interface QRSectionProps {
  initialCards?: QRCard[]
}

export default function QRSection({ initialCards }: QRSectionProps) {
  const { data: session } = useSession()
  const isAdmin = !!session?.user?.email
  const showAdminControls = isAdmin

  const [editing, setEditing] = useState(false)
  const [cards, setCards] = useState<QRCard[]>(initialCards && initialCards.length > 0 ? initialCards : defaultCards)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<number | null>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (initialCards && initialCards.length > 0) setCards(initialCards)
  }, [initialCards])

  const updateCard = (index: number, field: keyof QRCard, value: string) => {
    setCards(prev => prev.map((card, i) => i === index ? { ...card, [field]: value } : card))
  }

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(index)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload-qr', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      updateCard(index, 'imageSrc', url)
    } catch (err) {
      console.error('Image upload error:', err)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'qr',
          cards: cards.map((card, i) => ({ card_data: card, sort_order: i })),
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setEditing(false)
    } catch (err) {
      console.error('Error saving QR cards:', err)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="neo-card neo-card-alt py-10 px-6 fade-in relative" aria-label="QR codes for CV and WhatsApp">
      <div className="relative z-10">
        <div className="text-center mb-8 flex items-center justify-center gap-3">
          <div>
            <h3 className="text-2xl font-extrabold mb-2 inline-block bg-neo-lime border-neo border-neo-border px-3 py-1 shadow-neo-sm -rotate-1">Scan &amp; Connect</h3>
            <p className="font-semibold text-[color:var(--neo-ink-soft)]">Use these QR codes for my CV and WhatsApp contact.</p>
          </div>
          {showAdminControls && (
            <button onClick={() => setEditing(!editing)} className="neo-btn neo-btn-yellow w-10 h-10 !p-0" aria-label={editing ? 'Close editor' : 'Edit QR codes'}>
              {editing ? <FaTimes className="w-4 h-4" /> : <FaCog className="w-4 h-4" />}
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4 max-w-lg mx-auto">
            {cards.map((card, idx) => (
              <div key={idx} className="neo-panel p-4 space-y-3">
                <span className="text-sm font-extrabold">{card.label}</span>
                <div>
                  <label className="text-xs font-bold block mb-1 uppercase">Label</label>
                  <input type="text" value={card.label} onChange={(e) => updateCard(idx, 'label', e.target.value)} className="neo-input !py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 uppercase">QR Code Image</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => fileInputRefs.current[idx]?.click()} disabled={uploading === idx} className="neo-btn neo-btn-cyan !py-1.5 text-sm">
                      {uploading === idx ? 'Uploading...' : 'Upload New QR'}
                    </button>
                    <input ref={el => { fileInputRefs.current[idx] = el }} type="file" accept="image/*" onChange={(e) => handleImageUpload(idx, e)} className="hidden" />
                    <span className="text-xs font-semibold truncate max-w-[200px]">{card.imageSrc.startsWith('data:') ? 'Custom upload' : card.imageSrc}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 uppercase">Or use image URL</label>
                  <input type="text" value={card.imageSrc.startsWith('data:') ? '' : card.imageSrc} onChange={(e) => updateCard(idx, 'imageSrc', e.target.value)} placeholder="/qr_code/My_CV-1024.svg" className="neo-input !py-1.5 text-sm" />
                </div>
                {card.imageSrc && (
                  <img src={card.imageSrc} alt="QR Preview" className="w-24 h-24 mx-auto neo-panel p-1" />
                )}
                <div>
                  <label className="text-xs font-bold block mb-1 uppercase">Scan URL (where the QR code points to)</label>
                  <input type="text" value={card.linkUrl} onChange={(e) => updateCard(idx, 'linkUrl', e.target.value)} placeholder="https://example.com or /cv/file.pdf" className="neo-input !py-1.5 text-sm" />
                </div>
              </div>
            ))}
            <button onClick={handleSave} disabled={saving} className="neo-btn neo-btn-cyan w-full py-2 text-sm">
              <FaSave className="w-3 h-3" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mx-auto">
            {cards.map((card, idx) => (
              <div key={idx} className="neo-card neo-interactive p-5">
                <h4 className={`text-sm font-extrabold mb-4 inline-block border-2 border-neo-border px-2 py-0.5 ${headerColorMap[card.textColor] || 'bg-neo-cyan'}`}>{card.label}</h4>
                <div className="neo-panel p-4 bg-white flex justify-center">
                  <img src={card.imageSrc} alt={`QR code for ${card.label}`} className="w-52 h-52 max-w-full object-contain" loading="lazy" />
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: '2px dashed var(--neo-border)' }}>
                  {card.buttonType === 'cv' ? (
                    <a href={card.linkUrl || profile.cvPath} target="_blank" rel="noopener noreferrer" className="neo-btn neo-btn-yellow w-full py-2.5 text-sm uppercase tracking-wide">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View CV
                    </a>
                  ) : (
                    <WhatsAppButton href={card.linkUrl} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!editing && <AnimatedTechCards />}
      </div>
    </section>
  )
}
