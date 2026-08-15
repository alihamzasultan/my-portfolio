import { MetadataRoute } from 'next'
import { sql } from '@/lib/db'

const SITE_URL = process.env.SITE_URL || 'https://alihamzasultan.vercel.app'

export const revalidate = 3600

/**
 * Emits the homepage plus one entry per published post, using the canonical
 * slug URL so search engines index the same URL the site links to.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: MetadataRoute.Sitemap = []
  let projects: MetadataRoute.Sitemap = []

  try {
    const rows = await sql`
      SELECT slug, id, published_date, updated_date
      FROM blogs
      WHERE content IS NOT NULL AND content <> ''
    `
    posts = rows.map((r: any) => ({
      url: `${SITE_URL}/blogs/${r.slug || r.id}`,
      lastModified: new Date(r.updated_date || r.published_date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('sitemap: failed to load blogs', error)
  }

  try {
    const rows = await sql`SELECT slug, id, created_at FROM projects`
    projects = rows.map((r: any) => ({
      url: `${SITE_URL}/projects/${r.slug || r.id}`,
      lastModified: new Date(r.created_at || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('sitemap: failed to load projects', error)
  }

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...posts,
    ...projects,
  ]
}
