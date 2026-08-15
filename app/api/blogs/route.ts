import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const data = await sql`SELECT * FROM blogs WHERE id = ${parseInt(id)}`
      if (!data || data.length === 0) {
        return new Response('Not Found', { status: 404 })
      }
      return NextResponse.json(data[0])
    }

    // List view: exclude the heavy 'content' column to save bandwidth & memory!
    // `slug` is needed for canonical links; `content` stays excluded because it
    // is the heavy column this list endpoint exists to avoid shipping.
    const data = await sql`SELECT id, slug, title, summary, url, image, published_date, tags FROM blogs ORDER BY published_date DESC`
    return NextResponse.json(data || [])
  } catch (err) {
    console.error('GET /api/blogs error', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
