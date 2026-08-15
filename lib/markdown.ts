/**
 * A lightweight, zero-dependency Markdown-to-HTML converter.
 *
 * Supports headings (with anchor ids), bold, italics, code blocks, inline code,
 * ordered/unordered lists, blockquotes, GFM pipe tables, and `chart` fenced
 * blocks that render to inline SVG.
 *
 * Security: all input is HTML-escaped. Fenced blocks are lifted out into
 * placeholders *before* escaping and re-inserted after, so no author-supplied
 * markup ever reaches the output — charts are built from a parsed JSON spec,
 * not from raw SVG in the source.
 */

export interface ChartPoint {
  label: string
  value: number
}

interface ChartSpec {
  type?: 'bar' | 'line'
  title?: string
  unit?: string
  /** Optional caption rendered under the chart. */
  caption?: string
  data: ChartPoint[]
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Turns a heading into a stable, URL-safe anchor id. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

const PALETTE = ['#4d9bff', '#ff7eb6', '#9ae66e', '#ffd23f', '#b69cff', '#4cd4e8']

/**
 * Renders a chart spec to a self-contained inline SVG. Values are drawn to
 * scale against the largest value in the series.
 */
function renderChart(spec: ChartSpec): string {
  const data = (spec.data || []).filter((d) => typeof d.value === 'number')
  if (!data.length) return ''

  const width = 720
  const rowH = 46
  const labelW = 190
  const barMaxW = width - labelW - 90
  const height = data.length * rowH + 24
  const max = Math.max(...data.map((d) => d.value)) || 1
  const unit = spec.unit ? escapeHtml(spec.unit) : ''

  const rows = data
    .map((d, i) => {
      const y = i * rowH + 12
      const w = Math.max(2, (d.value / max) * barMaxW)
      const color = PALETTE[i % PALETTE.length]
      return `
    <text x="0" y="${y + 20}" font-size="13" font-family="ui-monospace,monospace" fill="currentColor">${escapeHtml(
        String(d.label)
      )}</text>
    <rect x="${labelW}" y="${y + 6}" width="${w}" height="22" fill="${color}" stroke="#111" stroke-width="2" />
    <text x="${labelW + w + 8}" y="${y + 22}" font-size="13" font-weight="700" font-family="ui-monospace,monospace" fill="currentColor">${escapeHtml(
        String(d.value)
      )}${unit}</text>`
    })
    .join('')

  const title = spec.title
    ? `<figcaption class="neo-chart-title">${escapeHtml(spec.title)}</figcaption>`
    : ''
  const caption = spec.caption
    ? `<figcaption class="neo-chart-caption">${escapeHtml(spec.caption)}</figcaption>`
    : ''

  return `<figure class="neo-chart">${title}<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="${escapeHtml(
    spec.title || 'chart'
  )}" preserveAspectRatio="xMinYMin meet">${rows}</svg>${caption}</figure>`
}

const ESCAPED_STAR = '⁣STAR⁣'

/**
 * Inline-level markdown: code, bold, italics, links. Shared between body text
 * and table cells so both get the same treatment.
 */
function inline(s: string): string {
  return (
    s
      // Protect a backslash-escaped asterisk first — otherwise it opens an
      // italic run that swallows the remainder of the document.
      .replace(/\\\*/g, ESCAPED_STAR)
      .replace(/`([^`]+)`/g, '<code class="neo-inline-code">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italics may not span a line break, which keeps a stray '*' contained.
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text: string, href: string) => {
        const external = /^https?:\/\//.test(href)
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : ''
        return `<a href="${href}"${attrs} class="neo-md-link">${text}</a>`
      })
      .split(ESCAPED_STAR)
      .join('*')
  )
}

/** Converts a GFM pipe table block into a semantic <table>. */
function renderTable(block: string): string | null {
  const lines = block.trim().split('\n')
  if (lines.length < 2) return null
  if (!/^\s*\|?[\s:-]*-[\s:|-]*\|?\s*$/.test(lines[1])) return null

  const cells = (line: string) =>
    line
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim())

  const head = cells(lines[0])
  const body = lines
    .slice(2)
    .filter((l) => l.trim())
    .map(cells)

  const thead = `<thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead>`
  const tbody = `<tbody>${body
    .map((row) => `<tr>${row.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
    .join('')}</tbody>`

  return `<div class="neo-table-wrap"><table class="neo-md-table">${thead}${tbody}</table></div>`
}

export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return ''

  // --- 1. Lift fenced blocks out before escaping -------------------------
  const blocks: string[] = []
  const stash = (html: string) => {
    blocks.push(html)
    return ` BLOCK${blocks.length - 1} `
  }

  const src = markdown.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang: string, body: string) => {
    if (lang === 'chart') {
      try {
        return stash(renderChart(JSON.parse(body) as ChartSpec))
      } catch {
        return stash('')
      }
    }
    return stash(
      `<pre class="neo-code-block"><code class="language-${escapeHtml(lang)}">${escapeHtml(
        body.trim()
      )}</code></pre>`
    )
  })

  // --- 2. Escape everything else ----------------------------------------
  let html = escapeHtml(src)

  // --- 3. Tables (before inline rules so the pipes survive) --------------
  html = html.replace(/(?:^\|.*\|[ \t]*$\n?){2,}/gm, (block) => {
    const rendered = renderTable(block)
    return rendered ? stash(rendered) + '\n' : block
  })

  // --- 4. Headings, with anchor ids for deep links -----------------------
  const heading = (level: number, tag: number, cls: string) => {
    html = html.replace(new RegExp(`^${'#'.repeat(level)} (.*?)$`, 'gm'), (_m, text: string) => {
      const plain = text.replace(/<[^>]+>/g, '').replace(/[*`]/g, '')
      return `<h${tag} id="${slugifyHeading(plain)}" class="${cls}">${text}</h${tag}>`
    })
  }
  heading(4, 4, 'neo-md-h4')
  heading(3, 3, 'neo-md-h3')
  heading(2, 2, 'neo-md-h2')
  // A '#' renders as <h2>: the page template already supplies the document's
  // single <h1>, and a second one is an SEO defect.
  heading(1, 2, 'neo-md-h2')

  // --- 5. Blockquotes ----------------------------------------------------
  html = html.replace(/^&gt;\s?(.*?)$/gm, '<blockquote class="neo-md-quote">$1</blockquote>')

  // --- 6. Lists ----------------------------------------------------------
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="neo-md-li" data-ol>$1</li>')
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li class="neo-md-li">$1</li>')

  // --- 7. Inline formatting (code, emphasis, links) ----------------------
  html = inline(html)

  // --- 8. Block assembly -------------------------------------------------
  const segments = html.split(/\n\n+/)
  html = segments
    .map((seg) => {
      const trimmed = seg.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith(' BLOCK')) return seg
      if (/^<(h[1-4]|pre|blockquote)/.test(trimmed)) return seg
      // Wrap runs of list items in a real list element
      if (trimmed.startsWith('<li')) {
        const tag = trimmed.includes('data-ol') ? 'ol' : 'ul'
        return `<${tag} class="neo-md-list">${trimmed}</${tag}>`
      }
      return `<p class="neo-md-p">${seg.replace(/\n/g, '<br />')}</p>`
    })
    .filter(Boolean)
    .join('\n')

  // --- 9. Restore lifted blocks ------------------------------------------
  html = html.replace(/ BLOCK(\d+) /g, (_m, i: string) => blocks[Number(i)] ?? '')

  return html
}

/**
 * Extracts `## FAQ`-style question/answer pairs so they can be emitted as
 * FAQPage structured data. Questions are the h3s under a heading containing
 * "FAQ".
 */
export function extractFaqs(markdown: string): { question: string; answer: string }[] {
  if (!markdown) return []
  const faqSection = markdown.split(/^##\s+.*FAQ.*$/im)[1]
  if (!faqSection) return []
  const stop = faqSection.split(/^##\s+/m)[0]

  const faqs: { question: string; answer: string }[] = []
  const parts = stop.split(/^###\s+/m).slice(1)
  for (const part of parts) {
    const [q, ...rest] = part.split('\n')
    const answer = rest
      .join(' ')
      .replace(/[*`#>|-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (q && answer) faqs.push({ question: q.trim(), answer: answer.slice(0, 600) })
  }
  return faqs
}
