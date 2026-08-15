import Link from 'next/link'
import type { Metadata } from 'next'
import TagBadge from '@/components/TagBadge'
import SectionHeading from '@/components/SectionHeading'
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
  tags?: string[]
  word_count?: number
}

export const metadata: Metadata = {
  title: 'Blog',
  description: `Writing on AI engineering, agentic systems, voice AI, RAG architectures and automation by ${profile.name}, ${profile.title}.`,
  keywords: [
    'AI engineer blog',
    'AI automation engineer',
    'voice AI',
    'RAG',
    'agentic AI',
    'LLM orchestration',
  ],
  alternates: { canonical: '/blogs' },
  openGraph: {
    type: 'website',
    title: `Blog | ${profile.name}`,
    description: 'Writing on AI engineering, agentic systems, voice AI and automation.',
    url: `${SITE_URL}/blogs`,
  },
}

async function getBlogs(): Promise<IBlog[]> {
  try {
    // `content` is excluded (it is large); its length gives the reading time.
    const rows = await sql`
      SELECT id, slug, title, summary, meta_description, url, image,
             published_date, tags,
             array_length(regexp_split_to_array(coalesce(content, ''), '\\s+'), 1) AS word_count
      FROM blogs
      ORDER BY published_date DESC
    `
    return rows as IBlog[]
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return []
  }
}

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogsIndexPage() {
  const blogs = await getBlogs()

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${profile.name} — Blog`,
    url: `${SITE_URL}/blogs`,
    author: { '@type': 'Person', name: profile.name, url: SITE_URL },
    blogPost: blogs.map((b) => ({
      '@type': 'BlogPosting',
      headline: b.title,
      datePublished: b.published_date,
      url: `${SITE_URL}/blogs/${b.slug || b.id}`,
      ...(b.meta_description || b.summary ? { description: b.meta_description || b.summary } : {}),
    })),
  }

  return (
    <main className="min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <Link href="/" className="neo-btn neo-btn-cyan mb-8 inline-flex text-sm">
          ← Back to Home Page
        </Link>

        <SectionHeading
          index="05"
          label="Blogs"
          title="Writing"
          tag={`${blogs.length} post${blogs.length === 1 ? '' : 's'} ✦`}
        />

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {blogs.map((blog) => {
              const href = blog.slug || blog.id ? `/blogs/${blog.slug || blog.id}` : blog.url || '#'
              const minutes = Math.max(1, Math.round((blog.word_count || 220) / 220))

              return (
                <article
                  key={blog.id}
                  className="group neo-card neo-tilt acc-yellow p-5 sm:p-6 flex flex-col gap-4"
                  role="listitem"
                >
                  {blog.image && (
                    <Link
                      href={href}
                      className="rounded-neo overflow-hidden aspect-[1200/630] w-full border-neo border-neo-border bg-[color:var(--neo-surface-2)] block"
                    >
                      <img
                        src={blog.image}
                        alt={`Cover art for ${blog.title}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider bg-neo-yellow border-2 border-black px-2 py-0.5 shadow-neo-sm">
                      <time dateTime={blog.published_date}>{formatDate(blog.published_date)}</time>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider bg-neo-cyan border-2 border-black px-2 py-0.5 shadow-neo-sm">
                      {minutes} min
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold leading-tight break-words line-clamp-3 group-hover:text-[color:var(--neo-blue)] transition duration-200">
                    <Link href={href}>{blog.title}</Link>
                  </h2>

                  {blog.summary && (
                    <p className="text-sm text-[color:var(--neo-ink-soft)] line-clamp-3">
                      {blog.summary}
                    </p>
                  )}

                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.slice(0, 3).map((tag, idx) => (
                        <TagBadge key={idx} tag={tag} variant="auto" />
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="neo-tag neo-tag-cyan">+{blog.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto">
                    <Link href={href} className="neo-btn neo-btn-yellow text-sm py-1.5 px-3">
                      Read Article →
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="neo-card p-8 text-center font-mono">No posts published yet.</p>
        )}
      </div>
    </main>
  )
}
