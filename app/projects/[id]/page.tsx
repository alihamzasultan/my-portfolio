import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiHuggingface } from 'react-icons/si'
import LazyVideo from '@/components/LazyVideo'
import TagBadge from '@/components/TagBadge'
import ProjectCarousel from '@/components/ProjectCarousel'
import { ViewTransition } from 'react'
import { sql } from '@/lib/db'
import { profile } from '@/lib/profile'

export const revalidate = 3600

const SITE_URL = process.env.SITE_URL || 'https://alihamzasultan.vercel.app'

interface IProject {
  id: number
  slug?: string | null
  title: string
  description?: string
  github_url?: string
  huggingface_url?: string
  tags?: string[]
  image?: string
  demo_video?: string
  created_at?: string
}

/**
 * Resolves by slug first, falling back to a numeric id so older links keep
 * working. The numeric form is marked non-canonical in generateMetadata.
 */
async function getProject(param: string): Promise<IProject | null> {
  try {
    const bySlug = await sql`SELECT * FROM projects WHERE slug = ${param} LIMIT 1`
    if (bySlug.length) return bySlug[0] as IProject

    if (/^\d+$/.test(param)) {
      const byId = await sql`SELECT * FROM projects WHERE id = ${Number(param)} LIMIT 1`
      if (byId.length) return byId[0] as IProject
    }
    return null
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

async function getOtherProjects(currentId: number): Promise<IProject[]> {
  try {
    const rows = await sql`
      SELECT id, slug, title, image, demo_video, tags
      FROM projects
      WHERE id <> ${currentId}
      ORDER BY created_at DESC
    `
    return rows as IProject[]
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  try {
    const rows = await sql`SELECT slug, id FROM projects`
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
  const project = await getProject(id)
  if (!project) return { title: 'Project Not Found' }

  const description = (project.description || '').slice(0, 180)
  const canonicalPath = `/projects/${project.slug || project.id}`
  // Reaching a project by numeric id is a non-canonical duplicate: it still
  // renders so old links survive, but only the slug URL is indexable.
  const isCanonical = !project.slug || id === project.slug

  return {
    title: project.title,
    description,
    keywords: project.tags,
    alternates: { canonical: canonicalPath },
    robots: isCanonical ? undefined : { index: false, follow: true },
    openGraph: {
      type: 'article',
      title: project.title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      images: project.image ? [{ url: project.image, alt: project.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      images: project.image ? [project.image] : undefined,
    },
  }
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) notFound()

  const otherProjects = await getOtherProjects(project.id)
  const canonicalUrl = `${SITE_URL}/projects/${project.slug || project.id}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description || '',
    url: canonicalUrl,
    keywords: (project.tags || []).join(', '),
    author: { '@type': 'Person', name: profile.name, url: SITE_URL },
    ...(project.image ? { image: `${SITE_URL}${project.image}` } : {}),
  }

  return (
    <main className="min-h-screen pb-12 overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <div className="mb-12">
          <Link href="/#projects" className="neo-btn neo-btn-cyan mb-6 text-sm">
            ← Back to Projects
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 break-words mt-6">
            {project.title}
          </h1>

          {/* Full, unclamped description — the card upstream shows a summary. */}
          {project.description && (
            <p className="text-lg mb-8 leading-relaxed text-[color:var(--neo-ink-soft)] font-medium">
              {project.description}
            </p>
          )}

          {(project.github_url || project.huggingface_url) && (
            <div className="flex flex-wrap gap-4 mb-8">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neo-btn neo-btn-ink"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0.5C5.5 0.5 0.5 5.5 0.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6.8 1.6.8.9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.5-.3-5.1-1.2-5.1-5.3 0-1.2.4-2.1 1.1-2.8-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 2.9 1.1.8-.2 1.7-.4 2.6-.4s1.8.1 2.6.4c2-1.4 2.9-1.1 2.9-1.1.6 1.5.2 2.6.1 2.9.7.7 1.1 1.6 1.1 2.8 0 4-2.6 5-5.1 5.3.4.4.8 1 .8 2v3c0 .3.2.7.8.6C20.7 21.4 24 17.1 24 12c0-6.5-5-11.5-12-11.5z" /></svg>
                  <span>View Repository</span>
                </a>
              )}
              {project.huggingface_url && (
                <a
                  href={project.huggingface_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neo-btn neo-btn-yellow"
                >
                  <SiHuggingface className="w-5 h-5" />
                  <span>View Live Demo</span>
                </a>
              )}
            </div>
          )}

          {/* Every tag, not the truncated set shown on the card. */}
          {project.tags && project.tags.length > 0 && (
            <div
              className="flex flex-wrap gap-2 pt-6"
              style={{ borderTop: 'var(--neo-bw) solid var(--neo-border)' }}
            >
              {project.tags.map((tag, idx) => (
                <TagBadge key={idx} tag={tag} variant="auto" />
              ))}
            </div>
          )}
        </div>

        {project.demo_video && (
          <ViewTransition name={`project-media-${project.id}`} share="auto" default="none">
            <div className="mb-16">
              <h2 className="text-2xl font-extrabold mb-6 inline-block bg-neo-blue border-neo border-neo-border px-3 py-1.5 shadow-neo-sm -rotate-1">
                Demo Video
              </h2>
              <div className="neo-card overflow-hidden p-0">
                <LazyVideo src={project.demo_video} alt={`${project.title} demo video`} className="w-full h-auto" />
              </div>
            </div>
          </ViewTransition>
        )}

        {project.image && !project.demo_video && (
          <ViewTransition name={`project-media-${project.id}`} share="auto" default="none">
            <div className="mb-16 neo-card overflow-hidden p-0">
              <img
                src={project.image}
                alt={`Cover art for ${project.title}`}
                className="w-full h-auto"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </ViewTransition>
        )}

        <ProjectCarousel
          title="More Projects"
          items={otherProjects as any}
          hrefBase="/projects"
          accent="blue"
        />
      </div>
    </main>
  )
}
