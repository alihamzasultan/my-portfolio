import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import TagBadge from '@/components/TagBadge'
import { parseMarkdownToHtml, extractFaqs } from '@/lib/markdown'
import { sql } from '@/lib/db'
import { profile } from '@/lib/profile'

export const revalidate = 3600

const SITE_URL = process.env.SITE_URL || 'https://alihamzasultan.vercel.app'

interface IBlog {
  id: number
  slug?: string | null
  title: string
  summary?: string
  meta_description?: string | null
  url?: string
  image?: string
  published_date: string
  updated_date?: string | null
  tags?: string[]
  content?: string
}

/**
 * Looks a post up by slug, falling back to numeric id so older /blogs/3 style
 * links keep resolving (they are then redirected to the canonical slug URL).
 */
async function getBlog(param: string): Promise<IBlog | null> {
  try {
    const bySlug = await sql`SELECT * FROM blogs WHERE slug = ${param} LIMIT 1`
    if (bySlug.length) return bySlug[0] as IBlog

    if (/^\d+$/.test(param)) {
      const byId = await sql`SELECT * FROM blogs WHERE id = ${Number(param)} LIMIT 1`
      if (byId.length) return byId[0] as IBlog
    }
    return null
  } catch (error) {
    console.error('Error fetching blog:', error)
    return null
  }
}

/** Pre-render every post at build time so crawlers get static HTML. */
export async function generateStaticParams() {
  try {
    const rows = await sql`SELECT slug, id FROM blogs`
    return rows.map((r: any) => ({ id: String(r.slug || r.id) }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const blog = await getBlog(id)
  if (!blog) return { title: 'Post Not Found' }

  const canonicalPath = `/blogs/${blog.slug || blog.id}`
  const description = blog.meta_description || blog.summary || ''
  // A post reached by numeric id is a non-canonical duplicate. It still renders
  // so old links do not break, but it is excluded from the index — the slug URL
  // in `canonical` is the only one search engines should keep.
  const isCanonical = !blog.slug || id === blog.slug

  return {
    title: blog.title,
    description,
    keywords: blog.tags,
    alternates: { canonical: canonicalPath },
    robots: isCanonical ? undefined : { index: false, follow: true },
    openGraph: {
      type: 'article',
      title: blog.title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      publishedTime: blog.published_date,
      modifiedTime: blog.updated_date || blog.published_date,
      authors: [profile.name],
      tags: blog.tags,
      images: blog.image ? [{ url: blog.image, alt: blog.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description,
      images: blog.image ? [blog.image] : undefined,
    },
  }
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}

export default async function BlogDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const blog = await getBlog(id)

  if (!blog) notFound()

  // The template renders the title above, so drop a leading '# Title' line from
  // the body rather than showing it twice.
  const body = (blog.content || '').replace(/^\s*#\s+.*\r?\n+/, '')
  const parsedContent = parseMarkdownToHtml(body)
  const faqs = extractFaqs(blog.content || '')
  const canonicalUrl = `${SITE_URL}/blogs/${blog.slug || blog.id}`
  const minutes = readingTime(blog.content || '')

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.meta_description || blog.summary || '',
    datePublished: blog.published_date,
    dateModified: blog.updated_date || blog.published_date,
    keywords: (blog.tags || []).join(', '),
    wordCount: (blog.content || '').trim().split(/\s+/).length,
    articleSection: 'Artificial Intelligence',
    inLanguage: 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    author: {
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.title,
      url: SITE_URL,
      sameAs: [profile.socialLinks.github, profile.socialLinks.linkedin].filter(Boolean),
    },
    publisher: {
      '@type': 'Person',
      name: profile.name,
      url: SITE_URL,
    },
    ...(blog.image ? { image: `${SITE_URL}${blog.image}` } : {}),
  }

  const faqSchema =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${SITE_URL}/#blogs` },
      { '@type': 'ListItem', position: 3, name: blog.title, item: canonicalUrl },
    ],
  }

  return (
    <main className="min-h-screen pb-12 overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <nav className="mb-8 flex items-center gap-3 text-sm" aria-label="Breadcrumb">
          <Link href="/" className="neo-btn neo-btn-cyan text-sm">
            ← Back to Home Page
          </Link>
        </nav>

        <article className="neo-card p-6 sm:p-10 md:p-12 bg-[color:var(--neo-surface)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-neo-yellow border-2 border-black px-2.5 py-1 shadow-neo-sm">
                <time dateTime={blog.published_date}>{blog.published_date}</time>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider bg-neo-cyan border-2 border-black px-2.5 py-1 shadow-neo-sm">
                {minutes} min read
              </span>
            </div>
            {blog.url && (
              <a
                href={blog.url}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn text-xs px-2.5 py-1 font-bold bg-neo-cyan"
              >
                View on External Platform 🔗
              </a>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight break-words text-[color:var(--neo-ink)]">
            {blog.title}
          </h1>

          {blog.summary && (
            <p className="text-base sm:text-lg mb-8 leading-relaxed font-bold text-[color:var(--neo-ink-soft)] bg-[color:var(--neo-bg-alt)] border-2 border-black p-4 shadow-neo-sm">
              {blog.summary}
            </p>
          )}

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-6 border-b-2 border-dashed border-neo-border mb-8">
              {blog.tags.map((tag, idx) => (
                <TagBadge key={idx} tag={tag} variant="auto" />
              ))}
            </div>
          )}

          {blog.content ? (
            <div
              className="neo-markdown-body prose max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          ) : (
            <p className="text-gray-400 italic">No content available for this post.</p>
          )}

          <footer className="mt-12 pt-6 border-t-2 border-dashed border-neo-border">
            <p className="font-mono text-sm text-[color:var(--neo-ink-soft)]">
              Written by <strong>{profile.name}</strong> — {profile.title}
            </p>
          </footer>
        </article>
      </div>
    </main>
  )
}
