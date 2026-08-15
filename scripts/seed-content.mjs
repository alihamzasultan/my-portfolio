/**
 * Seeds the portfolio with real content: experiences, projects, blogs and the
 * site_cards rows that drive the hero, expertise grid and contact card.
 *
 * Safe to re-run, it clears the content tables first, so it is a reset rather
 * than an append. It does NOT touch the `admins` or `contact_messages` tables.
 *
 *   node scripts/seed-content.mjs
 */
import { neon } from '@neondatabase/serverless'
import { blogs } from './blogs-data.mjs'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

let env = {}
try {
  const raw = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
  env = Object.fromEntries(
    raw
      .split('\n')
      .filter((l) => l.trim() && !l.startsWith('#'))
      .map((l) => {
        const i = l.indexOf('=')
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]
      })
  )
} catch {
  console.error('Failed to read .env.local. Make sure it exists.')
  process.exit(1)
}

if (!env.DATABASE_URL) {
  console.error('Error: DATABASE_URL is missing in .env.local')
  process.exit(1)
}

const sql = neon(env.DATABASE_URL)

const EMAIL = 'alihamzasultan6@gmail.com'
const PHONE = '+92 370 3108724'
const GITHUB = 'https://github.com/alihamzasultan'
const LINKEDIN = 'https://www.linkedin.com/in/ali-hamza-sultan-ai-automation-engineer/'

// ---------------------------------------------------------------- experiences

const experiences = [
  {
    sort_order: 0,
    title: 'AI Engineer',
    organization: 'Kodexo Labs',
    location: 'Karachi, Pakistan',
    start_date: '2025-09-01',
    end_date: 'Present',
    description:
      'Building and deploying production-grade agentic AI systems: real-time voice agents, document-intelligence pipelines, and CRM-connected automation across the business.',
    highlights: [
      'Build and deploy real-time AI voice agents (Vapi, ElevenLabs) that qualify leads, book/cancel/reschedule appointments, remember prior conversations, and sync data via webhooks, including dental booking agents and lead-qualification agents for enterprise clients.',
      'Engineered the complete website, service platform, WhatsApp AI agent, and Vapi voice agent; built a custom Chatwoot deployment for companies.',
      'Developed real-estate document-intelligence agents that extract lease data, calculate real-time lease terms, and notify admins via Slack/email, cutting manual document review.',
      'Built AI content automation: social posts generated with Claude and auto-scheduled, plus real-time-data blog pipelines that auto-publish articles fully crawlable by Googlebot and LLM/AI bots.',
      'Built GoHighLevel automations for triggered email/SMS campaigns and webhook-based pipelines syncing caller/lead data into HubSpot and Pipedrive in real time.',
    ],
    tags: ['Vapi', 'ElevenLabs', 'n8n', 'GoHighLevel', 'HubSpot', 'Chatwoot', 'Claude', 'Twilio'],
  },
  {
    sort_order: 1,
    title: 'Lecturer, Computer Science',
    organization: 'Bahria College Karsaz',
    location: 'Karachi, Pakistan',
    start_date: '2026-02-01',
    end_date: 'Present',
    description:
      'Teaching Computer Science with a focus on programming fundamentals, artificial intelligence, and data structures.',
    highlights: [
      'Deliver instruction in Computer Science covering programming fundamentals, artificial intelligence, and data structures; design course materials, assignments, and assessments.',
      'Mentor students on AI and automation concepts, bridging classroom theory with real-world industry practice.',
    ],
    tags: ['Teaching', 'Artificial Intelligence', 'Data Structures', 'Python'],
  },
  {
    sort_order: 2,
    title: 'AI Software Developer (Remote)',
    organization: 'Bahria Technologies',
    location: 'Karachi, Pakistan',
    start_date: '2024-04-01',
    end_date: '2025-08-01',
    description:
      'Built analytics dashboards and automated backend workflows for internal and client-facing platforms.',
    highlights: [
      'Built Angular-based dashboards serving 50+ users with real-time analytics.',
      'Automated backend workflows (API development, authentication, data processing) in Node.js and Python, reducing manual work by 80%.',
    ],
    tags: ['Angular', 'Node.js', 'Python', 'REST APIs'],
  },
  {
    sort_order: 3,
    title: 'AI Software Development Engineer (On-Site)',
    organization: 'Authentik Track and Trace',
    location: 'Karachi, Pakistan',
    start_date: '2024-01-01',
    end_date: '2025-12-01',
    description:
      'Developed and maintained web dashboards, database management systems, and backend automation services.',
    highlights: [
      'Developed and maintained Angular-based web dashboards and database management systems.',
      'Built and optimized frontend applications using Angular, ensuring a seamless user experience and strong performance.',
      'Developed and managed automation scripts and backend services using Node.js and Python, handling API development, authentication, and data processing.',
    ],
    tags: ['Angular', 'Node.js', 'Python', 'MySQL'],
  },
]

// ------------------------------------------------------------------- projects

const projects = [
  {
    slug: 'ai-voice-agent-automation',
    title: 'AI Voice Agent Automation for Multi-Segment Customer Engagement',
    description:
      'An AI voice agent handling inbound and outbound conversations across B2C families, B2B advisors, shop inquiries, and customer support, with strictly segmented conversation flows. Integrates GPT-4, ElevenLabs, Twilio, and n8n for conversational intelligence, voice generation, call handling, and orchestration, with webhook-based data capture updating HubSpot automatically.',
    github_url: GITHUB,
    huggingface_url: null,
    image: '/projects/voice-agent.svg',
    tags: ['GPT-4', 'ElevenLabs', 'Twilio', 'n8n', 'HubSpot', 'Voice AI'],
  },
  {
    slug: 'multi-agent-rag-course-generator',
    title: 'AI-Powered Course Script Generation System with Multi-Agent RAG',
    description:
      'A 6-agent AI workflow in n8n that generates structured 35-day course scripts using a Retrieval-Augmented Generation architecture with Claude 3.5 Sonnet and a Supabase Vector Store. The pipeline is automated end to end, topic selection, context retrieval, draft creation, validation, and final formatting, cutting manual research and writing effort significantly.',
    github_url: GITHUB,
    huggingface_url: null,
    image: '/projects/course-rag.svg',
    tags: ['n8n', 'RAG', 'Claude 3.5 Sonnet', 'Supabase', 'Multi-Agent', 'Vector Store'],
  },
  {
    slug: 'ai-fashion-design-virtual-try-on',
    title: 'AI-Powered Fashion Design & Virtual Try-On App',
    description:
      'An SDXL + IP-Adapter backend that generates apparel designs and fits them onto user photos with 95% accuracy, paired with a React Native app for browsing, designing, and trying on garments.',
    github_url: GITHUB,
    huggingface_url: null,
    image: '/projects/fashion-tryon.svg',
    tags: ['SDXL', 'IP-Adapter', 'React Native', 'Computer Vision', 'Generative AI'],
  },
]

// ---------------------------------------------------------------------- blogs

// ----------------------------------------------------------------- site cards

const expertiseCards = [
  {
    title: 'Agentic & Voice AI',
    cls: 'acc-pink',
    bgColor: 'bg-neo-pink',
    description:
      'Designing real-time conversational agents that hold context across calls, book and reschedule appointments, and push structured data straight into business systems.',
    example: 'Dental booking agents and enterprise lead-qualification agents built on Vapi, ElevenLabs, Retell AI and Twilio.',
    animationType: 'coding',
  },
  {
    title: 'Low-Code Automation & Orchestration',
    cls: 'acc-blue',
    bgColor: 'bg-neo-blue',
    description:
      'Building multi-step automation pipelines that connect LLMs, APIs and CRMs into workflows a business can actually operate.',
    example: 'n8n, Make, Zapier, GoHighLevel and custom Chatwoot deployments wired into live support and sales pipelines.',
    animationType: 'workflow',
  },
  {
    title: 'AI / LLM Integration & RAG',
    cls: 'acc-lime',
    bgColor: 'bg-neo-lime',
    description:
      'Integrating frontier models and Retrieval-Augmented Generation architectures so systems answer from your data instead of guessing.',
    example: 'Multi-agent RAG on Claude 3.5 Sonnet with a Supabase Vector Store generating validated long-form course content.',
    animationType: 'cognitive',
  },
  {
    title: 'Full-Stack AI Application Development',
    cls: 'acc-yellow',
    bgColor: 'bg-neo-yellow',
    description:
      'Shipping complete products around AI models, frontend, API layer, auth and data, not just the notebook that proves the idea.',
    example: 'Angular and React Native dashboards, Node.js and Python services, Flask and Django backends serving live models.',
    animationType: 'fullstack',
  },
  {
    title: 'AI Content Engines & Programmatic SEO',
    cls: 'acc-orange',
    bgColor: 'bg-neo-orange',
    description:
      'Automated content pipelines that publish on real-time data and stay fully crawlable by both search engines and LLM bots.',
    example: 'Claude-generated social scheduling plus auto-published article pipelines crawlable by Googlebot and AI crawlers.',
    animationType: 'seo',
  },
  {
    title: 'Sales Intelligence & CRM Engineering',
    cls: 'acc-pink',
    bgColor: 'bg-neo-pink',
    description:
      'Connecting lead sources, enrichment tools and CRMs into one pipeline where caller and lead data lands correctly in real time.',
    example: 'Webhook pipelines syncing voice-agent output into HubSpot and Pipedrive, with triggered email/SMS campaigns in GHL.',
    animationType: 'gtm',
  },
]

const heroCard = {
  name: 'Ali Hamza Sultan',
  greeting: 'HELLO WORLD 👋',
  status: 'OPEN TO WORK',
  badge: 'AI Automation Engineer',
  headingPrefix: 'Welcome to my',
  headingHighlight: 'Portfolio',
  bio: 'AI Automation Engineer and Computer Science Lecturer building production-grade agentic AI systems, real-time conversational voice agents, and full-stack automation pipelines. I work across voice AI, low-code orchestration, LLM integration and RAG architectures, turning models into systems that book appointments, move data between CRMs, and run without supervision.',
  typewriterSentences: [
    "Hello, I'm Ali Hamza Sultan.",
    'AI Automation Engineer.',
    'I build agentic AI systems.',
    'Real-time voice agents that book appointments.',
    'RAG architectures and LLM orchestration.',
    'From prototype to production.',
  ],
}

const contactCard = {
  cvPath: '/cv.pdf',
  links: [
    { label: 'Location', href: '', icon: 'location', displayText: 'Karachi, Pakistan' },
    { label: 'Phone Number', href: `tel:${PHONE.replace(/\s+/g, '')}`, icon: 'phone', displayText: PHONE },
    { label: 'Email', href: `mailto:${EMAIL}`, icon: 'email', displayText: EMAIL },
    { label: 'GitHub', href: GITHUB, icon: 'github', displayText: GITHUB.replace('https://', '') },
    { label: 'LinkedIn', href: LINKEDIN, icon: 'linkedin', displayText: 'linkedin.com/in/ali-hamza-sultan' },
  ],
}

// ------------------------------------------------------------------------ run

async function seed() {
  console.log('Clearing existing content...')
  await sql`DELETE FROM projects`
  await sql`DELETE FROM experiences`
  await sql`DELETE FROM blogs`
  await sql`DELETE FROM site_cards`

  console.log(`Inserting ${experiences.length} experiences...`)
  for (const e of experiences) {
    await sql`
      INSERT INTO experiences (title, organization, location, start_date, end_date, description, highlights, tags, sort_order)
      VALUES (${e.title}, ${e.organization}, ${e.location}, ${e.start_date}, ${e.end_date},
              ${e.description}, ${e.highlights}, ${e.tags}, ${e.sort_order})
    `
  }

  console.log(`Inserting ${projects.length} projects...`)
  for (const p of projects) {
    await sql`
      INSERT INTO projects (slug, title, description, github_url, huggingface_url, image, tags)
      VALUES (${p.slug}, ${p.title}, ${p.description}, ${p.github_url}, ${p.huggingface_url}, ${p.image}, ${p.tags})
    `
  }

  console.log(`Inserting ${blogs.length} blogs...`)
  for (const b of blogs) {
    await sql`
      INSERT INTO blogs (slug, title, summary, meta_description, published_date, updated_date, image, tags, content)
      VALUES (${b.slug}, ${b.title}, ${b.summary}, ${b.meta_description}, ${b.published_date},
              ${b.updated_date}, ${b.image}, ${b.tags}, ${b.content})
    `
  }

  console.log(`Inserting site cards (hero, contact, ${expertiseCards.length} expertise)...`)
  await sql`INSERT INTO site_cards (section, card_data, sort_order) VALUES ('hero', ${JSON.stringify(heroCard)}, 0)`
  await sql`INSERT INTO site_cards (section, card_data, sort_order) VALUES ('contact', ${JSON.stringify(contactCard)}, 0)`
  for (const [i, card] of expertiseCards.entries()) {
    await sql`INSERT INTO site_cards (section, card_data, sort_order) VALUES ('expertise', ${JSON.stringify(card)}, ${i})`
  }

  console.log('\nContent seeded successfully.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
