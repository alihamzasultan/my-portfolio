/**
 * Regenerates the QR codes served from public/qr_code/.
 *
 * QR codes must encode ABSOLUTE URLs — a phone scanning the screen has no
 * origin to resolve a relative path against, so `/cv.pdf` would be useless.
 *
 *   node scripts/generate-qr.mjs
 */
import QRCode from 'qrcode'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '..', 'public', 'qr_code')
mkdirSync(OUT, { recursive: true })

// Read SITE_URL from .env.local so the CV code always points at the live host.
let siteUrl = 'https://alihamzasultan.vercel.app'
try {
  const raw = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
  const match = raw.match(/^SITE_URL=(.*)$/m)
  if (match) siteUrl = match[1].trim().replace(/^['"]|['"]$/g, '')
} catch {
  /* fall back to the default above */
}

/**
 * Personal WhatsApp QR link, taken from the code exported from the WhatsApp app
 * (public/qr_code/whatsapp.jpeg decodes to exactly this).
 *
 * Note: a wa.me/qr/<id> link can be reset from inside WhatsApp, which would
 * invalidate this code. `https://wa.me/923703108724` never expires — swap the
 * value below if you would rather have the permanent form.
 */
const WHATSAPP_LINK = 'https://wa.me/qr/TANHF4H7LSUJH1'

const targets = [
  {
    file: 'CV.svg',
    data: `${siteUrl}/cv.pdf`,
    dark: '#111111',
    light: '#ffffff',
  },
  {
    file: 'WhatsApp.svg',
    data: WHATSAPP_LINK,
    dark: '#111111',
    light: '#ffffff',
  },
]

for (const t of targets) {
  const svg = await QRCode.toString(t.data, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 512,
    color: { dark: t.dark, light: t.light },
  })
  writeFileSync(resolve(OUT, t.file), svg, 'utf-8')
  console.log(`wrote ${t.file}  ->  ${t.data}`)
}

console.log('\nQR codes regenerated.')
