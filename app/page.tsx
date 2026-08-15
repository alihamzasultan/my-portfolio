import TagBadge from '../components/TagBadge'
import HomeContactQR from '../components/HomeContactQR'
import HeroCard from '../components/HeroCard'
import HeroStage from '../components/HeroStage'
import SectionHeading from '../components/SectionHeading'
import ContactCard from '../components/ContactCard'
import Link from 'next/link'
import { ViewTransition } from 'react'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { SiHuggingface } from 'react-icons/si'
import SvgIcon from '@/components/icons/SvgIcon'
import { sql } from '@/lib/db'
import { profile } from '@/lib/profile'
import { iconRegistry } from '@/lib/iconRegistry'
import { techIcons } from '@/lib/techIcons'
import ExpertiseCardAnimation from '@/components/ExpertiseCardAnimation'
import { Empty } from '@/components/retroui'

// Revalidate page every hour
export const revalidate = 3600

// Fetch data from Neon
async function getProjects() {
  try {
    const data = await sql`SELECT * FROM projects ORDER BY created_at DESC`
    return data || []
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

async function getExperiences() {
  try {
    // `sort_order` is authoritative: concurrent roles cannot be ranked by date,
    // so the primary role is pinned first. Dates only break ties.
    const data = await sql`SELECT * FROM experiences ORDER BY sort_order ASC`

    const sorted = (data || []).sort((a, b) => {
      const order = (a.sort_order ?? 0) - (b.sort_order ?? 0)
      if (order !== 0) return order
      if ((a.end_date === 'Present') !== (b.end_date === 'Present')) {
        return a.end_date === 'Present' ? -1 : 1
      }
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    })

    return sorted
  } catch (error) {
    console.error('Error fetching experiences:', error)
    return []
  }
}

async function getBlogs() {
  try {
    const data = await sql`SELECT * FROM blogs ORDER BY published_date DESC`
    return data || []
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return []
  }
}

async function getSiteCards() {
  try {
    const data = await sql`SELECT * FROM site_cards ORDER BY sort_order ASC`
    return data || []
  } catch (error) {
    console.error('Error fetching site cards:', error)
    return []
  }
}

// Mock data removed - now using real DB queries
const mockProjects = [
  {
    id: 1,
    title: "AI-Powered Sentiment Analysis",
    description: "Deep learning model for real-time sentiment analysis using BERT transformers",
    image: "https://via.placeholder.com/400x300?text=Sentiment+Analysis",
    demo_video: null,
    url: "https://github.com/your-github-username/sentiment-analysis",
    tags: ["PyTorch", "BERT", "NLP", "Deep Learning"],
    created_at: "2025-12-01"
  },
  {
    id: 2,
    title: "Computer Vision Object Detection",
    description: "Custom YOLOv8 model for multi-class object detection with real-time inference",
    image: "https://via.placeholder.com/400x300?text=Object+Detection",
    demo_video: null,
    url: "https://github.com/your-github-username/object-detection",
    tags: ["YOLOv8", "OpenCV", "Python", "Computer Vision"],
    created_at: "2025-11-15"
  },
  {
    id: 3,
    title: "Full-Stack Chat Application",
    description: "Real-time chat app with WebSocket integration, MongoDB backend, and React frontend",
    image: "https://via.placeholder.com/400x300?text=Chat+App",
    demo_video: null,
    url: "https://github.com/your-github-username/chat-app",
    tags: ["React", "Node.js", "MongoDB", "WebSocket"],
    created_at: "2025-10-20"
  },
  {
    id: 4,
    title: "Time Series Forecasting Model",
    description: "LSTM neural network for stock price prediction with 94% accuracy",
    image: "https://via.placeholder.com/400x300?text=Time+Series",
    demo_video: null,
    url: "https://github.com/your-github-username/time-series",
    tags: ["LSTM", "TensorFlow", "Time Series", "Forecasting"],
    created_at: "2025-09-10"
  },
  {
    id: 5,
    title: "Generative AI Image Editor",
    description: "AI-powered image manipulation tool using Stable Diffusion with inpainting",
    image: "https://via.placeholder.com/400x300?text=Image+Editor",
    demo_video: null,
    url: "https://github.com/your-github-username/image-editor",
    tags: ["Stable Diffusion", "Python", "FastAPI", "AI/ML"],
    created_at: "2025-08-05"
  },
  {
    id: 6,
    title: "Recommendation Engine",
    description: "Collaborative filtering recommendation system serving 100K+ users",
    image: "https://via.placeholder.com/400x300?text=Recommendation",
    demo_video: null,
    url: "https://github.com/your-github-username/rec-engine",
    tags: ["Recommendation Systems", "Scikit-learn", "Python", "ML"],
    created_at: "2025-07-15"
  }
]

const mockExperiences = [
  {
    id: 1,
    title: "AI/ML Engineer",
    organization: "Tech Innovations Ltd",
    location: "Ajman, UAE",
    start_date: "2024-06-01",
    end_date: "Present",
    description: "Leading AI/ML initiatives for enterprise automation and data pipeline optimization",
    highlights: [
      "Developed and deployed 5+ machine learning models in production",
      "Optimized data pipelines reducing processing time by 60%",
      "Led a team of 3 junior engineers on computer vision projects",
      "Implemented real-time inference system handling 10K+ requests/sec"
    ],
    tags: ["Python", "TensorFlow", "PyTorch", "AWS", "Kubernetes"]
  },
  {
    id: 2,
    title: "Full-Stack Developer",
    organization: "Digital Solutions Corp",
    location: "Dubai, UAE",
    start_date: "2023-03-15",
    end_date: "2024-05-30",
    description: "Built scalable web applications and microservices for 50+ enterprise clients",
    highlights: [
      "Developed 15+ full-stack applications using Next.js and Node.js",
      "Improved application performance by 45% through optimization",
      "Implemented CI/CD pipelines reducing deployment time by 80%",
      "Designed and maintained MongoDB database schemas"
    ],
    tags: ["Next.js", "Node.js", "React", "MongoDB", "Docker"]
  },
  {
    id: 3,
    title: "Junior Data Scientist",
    organization: "Analytics Hub",
    location: "Abu Dhabi, UAE",
    start_date: "2022-01-10",
    end_date: "2023-03-10",
    description: "Conducted statistical analysis and built predictive models for business insights",
    highlights: [
      "Created 20+ analytical reports for C-level decision making",
      "Built predictive models achieving 92% accuracy on test set",
      "Automated data collection reducing manual work by 70%",
      "Trained stakeholders on data literacy and analytics best practices"
    ],
    tags: ["Python", "SQL", "Pandas", "Scikit-learn", "Tableau"]
  }
]

const mockCertificates = [
  {
    id: 1,
    title: "Deep Learning Specialization",
    issuer: "Coursera (Andrew Ng)",
    issue_date: "2025-06-15",
    description: "5-course specialization in neural networks and deep learning",
    credential_url: "https://coursera.org/verify/specialization/deep-learning",
    tags: ["Deep Learning", "Neural Networks", "TensorFlow"]
  },
  {
    id: 2,
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    issue_date: "2025-05-20",
    description: "Professional certification for AWS cloud architecture design",
    credential_url: "https://aws.amazon.com/certification/certified-solutions-architect",
    tags: ["AWS", "Cloud", "Architecture"]
  },
  {
    id: 3,
    title: "Google Cloud Professional Data Engineer",
    issuer: "Google Cloud",
    issue_date: "2025-03-10",
    description: "Professional certification in Google Cloud data engineering",
    credential_url: "https://cloud.google.com/certification/data-engineer",
    tags: ["GCP", "Data Engineering", "BigQuery"]
  }
]

const defaultTechCategories = [
  {
    title: 'Agentic Coding & Multi-Agent Systems',
    cls: 'acc-pink',
    bgColor: 'bg-neo-pink',
    description: 'Engineering autonomous software agents that can read codebases, write code, run test suites, and self-correct using LLM reasoning loops.',
    example: 'Developer bots that auto-resolve GitHub issues, generate unit tests, and refactor legacy code.',
    animationType: 'coding'
  },
  {
    title: 'AI Workflows & LLM Orchestration',
    cls: 'acc-blue',
    bgColor: 'bg-neo-blue',
    description: 'Designing intelligent, multi-step workflows that string together LLMs, vector search, and API integrations to automate complex business processes.',
    example: 'Automation loops that ingest incoming support emails, query a vector database, and draft replies.',
    animationType: 'workflow'
  },
  {
    title: 'Full-Stack AI Application Development',
    cls: 'acc-lime',
    bgColor: 'bg-neo-lime',
    description: 'Building clean, highly interactive web applications that connect deep learning models and data dashboards to end-users.',
    example: 'Responsive Next.js applications with voice transcription, real-time sentiment analysis, and tag extraction.',
    animationType: 'fullstack'
  },
  {
    title: 'GTM Tech Stack & Growth Engineering',
    cls: 'acc-yellow',
    bgColor: 'bg-neo-yellow',
    description: 'Connecting tracking scripts, marketing automation tools, and CRM pipelines to build a unified analytics infrastructure for Go-To-Market teams.',
    example: 'Syncing user actions between Stripe, Segment, and HubSpot to automate onboarding and track CAC.',
    animationType: 'gtm'
  },
  {
    title: 'Programmatic SEO & Content Engines',
    cls: 'acc-orange',
    bgColor: 'bg-neo-orange',
    description: 'Building template-driven content engines that programmatically generate thousands of SEO-optimized pages based on structured data.',
    example: 'Systems generating unique local service landing pages using structured DB records and AI summaries.',
    animationType: 'seo'
  },
  {
    title: 'Intelligent Automation & Cognitive AI',
    cls: 'acc-pink',
    bgColor: 'bg-neo-pink',
    description: 'Designing intelligent automation frameworks and cognitive pipelines that ingest unstructured data, automate decision-making, and orchestrate complex business processes.',
    example: 'Cognitive search systems, auto-classification pipelines, and metadata enrichment engines.',
    animationType: 'cognitive'
  }
]

export default async function Home() {
  // Fetch all data from database in parallel
  const [projects, experiences, blogs, siteCards] =
    await Promise.all([
      getProjects(),
      getExperiences(),
      getBlogs(),
      getSiteCards(),
    ])

  // Replace base64 images with Supabase Storage URLs so the ISR page stays
  // under Vercel's 19 MB limit — images are served directly from CDN instead.
  // Run `node scripts/migrate-base64-to-storage.mjs` once to upload any
  // existing base64 images that are still stored inline in the database.
  const replaceBase64Images = <T extends { id: number; image?: string }>(
    items: T[],
    table: string
  ): T[] =>
    items.map(item => {
      if (typeof item.image === 'string' && item.image.startsWith('data:')) {
        return { ...item, image: `/api/media/${table}/${item.id}` }
      }
      return item
    })

  const safeProjects = replaceBase64Images(projects as any[], 'projects') as typeof projects

  // Parse contact and QR card data from the database
  const contactRow = siteCards.find((c: { section: string }) => c.section === 'contact')
  const contactData = contactRow?.card_data as { links?: Array<{ label: string; href: string; icon: string; displayText: string }>; cvPath?: string } | undefined
  const contactLinks = contactData?.links
  const contactCvPath = contactData?.cvPath

  const qrRows = siteCards.filter((c: { section: string }) => c.section === 'qr')
  const qrCards = qrRows.length > 0
    ? qrRows.map((r: { card_data: Record<string, unknown> }) => {
        const card = r.card_data as { label: string; imageSrc: string; borderColor: string; textColor: string; buttonType: 'cv' | 'whatsapp'; linkUrl: string }
        // Strip base64 data URLs to prevent oversized ISR pages
        if (card.imageSrc?.startsWith('data:')) {
          card.imageSrc = card.buttonType === 'cv'
            ? '/qr_code/CV.svg'
            : '/qr_code/WhatsApp.svg'
        }
        return card
      })
    : undefined

  const expertiseCards = siteCards.filter((c: { section: string }) => c.section === 'expertise')
  const techCategories = expertiseCards.length > 0
    ? expertiseCards
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((c: any) => ({
          ...(c.card_data as any),
          animationType: c.card_data.animationType || 'coding'
        }))
    : defaultTechCategories

  // Extract Hero Section configurations from siteCards
  const heroRow = siteCards.find((c: { section: string }) => c.section === 'hero')
  const heroData = heroRow?.card_data as {
    badge?: string
    headingPrefix?: string
    headingHighlight?: string
    bio?: string
    typewriterSentences?: string[]
    name?: string
    greeting?: string
    status?: string
  } | undefined

  const heroBadge = heroData?.badge || profile.title
  const heroHeadingPrefix = heroData?.headingPrefix || 'Welcome to my'
  const heroHeadingHighlight = heroData?.headingHighlight || 'Portfolio'
  const heroBio = heroData?.bio || profile.bio
  const typewriterPhrases = heroData?.typewriterSentences || profile.typewriterSentences
  const heroName = heroData?.name || profile.name
  const heroGreeting = heroData?.greeting || 'HELLO WORLD 👋'
  const heroStatus = heroData?.status || 'OPEN TO WORK'

  return (
    <div id="top" className="space-y-20">
      {/* Preload ALL card images so the browser fetches them in parallel during
          HTML parse — cards appear together, not gradually one-by-one. */}
      {safeProjects.map((p: any) =>
        p.image ? (
          <link key={`preload-p-${p.id}`} rel="preload" as="image" href={p.image} fetchPriority="high" />
        ) : null
      )}
      {/* Hero Section */}
      <HeroStage
        name={heroName}
        greeting={heroGreeting}
        status={heroStatus}
        typewriterSentences={typewriterPhrases}
      />

      {/* Intro cards — profile summary alongside the editable contact card */}
      <section id="about" className="fade-in overflow-visible" aria-label="About">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 items-stretch w-full overflow-visible">
          <HeroCard
            badge={heroBadge}
            headingPrefix={heroHeadingPrefix}
            headingHighlight={heroHeadingHighlight}
            description={heroBio}
          />

          <ContactCard initialLinks={contactLinks} initialCvPath={contactCvPath} />
        </div>
      </section>

      {/* Expertise Section */}
      <section id="expertise" className="fade-in overflow-visible" aria-label="Expertise">
        <SectionHeading index="02" label="Expertise" title="What I Do" tag="Building the future ✦" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full overflow-visible">
          {techCategories.map((cat, idx) => (
            <div
              key={cat.title}
              className={`group neo-card neo-tilt ${cat.cls} p-5 sm:p-6 flex flex-col w-full`}
              suppressHydrationWarning
            >
              {/* Animation at the top */}
              <div className="mb-5 h-[130px] w-full border-2 border-neo-border neo-panel overflow-hidden relative shadow-neo-sm">
                <ExpertiseCardAnimation index={idx} title={cat.title} animationType={cat.animationType} />
              </div>
              <div className="card-top mb-3">
                <span className="card-cat font-extrabold">{cat.title}</span>
              </div>
              <p className="text-sm font-semibold text-[color:var(--neo-ink-soft)] leading-relaxed flex-grow">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="fade-in overflow-visible" aria-label="Projects">
        <SectionHeading index="03" label="Projects" title="Selected Work" />
        
        {safeProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full overflow-visible" role="list">
            {/* Uniform `gap-4` owns every vertical space in the card, so the
                rhythm is identical across cards regardless of text length, and
                `mt-auto` on the actions row keeps the buttons aligned. */}
            {safeProjects.map((p: any, idx: number) => (
              <div
                key={String(p.id)}
                className="group neo-card neo-tilt acc-blue p-5 sm:p-6 flex flex-col gap-4 w-full"
                role="listitem"
                suppressHydrationWarning
              >
                <div className="card-top !mb-0">
                  <span className="card-cat">Project</span>
                </div>
                <ViewTransition name={`project-media-${p.id}`} share="auto" default="none">
                  <div className="w-full">
                    {p.image ? (
                      <div className="rounded-neo overflow-hidden aspect-[1200/630] w-full border-neo border-neo-border bg-[color:var(--neo-surface-2)] flex items-center justify-center">
                        <img src={p.image} alt={`Cover art for ${p.title}`} className="w-full h-full object-cover" decoding="async" fetchPriority="high" />
                      </div>
                    ) : p.demo_video ? (
                      <div className="rounded-neo overflow-hidden aspect-[1200/630] w-full border-neo border-neo-border bg-[color:var(--neo-surface-2)] flex items-center justify-center">
                        <svg className="w-16 h-16 text-[color:var(--neo-ink)]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="rounded-neo overflow-hidden aspect-[1200/630] w-full bg-neo-blue border-neo border-neo-border flex items-center justify-center">
                        <span className="text-center px-4 font-extrabold">{p.title}</span>
                      </div>
                    )}
                  </div>
                </ViewTransition>

                <h3 className="text-xl font-extrabold group-hover:text-[color:var(--neo-blue)] transition duration-200 break-words line-clamp-2" id={`project-${p.id}`}>
                  {p.title}
                </h3>

                {p.description && (
                  <p className="text-[color:var(--neo-ink-soft)] text-sm line-clamp-3">{p.description}</p>
                )}

                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {/* Cards show a summary; the details page lists every tag. */}
                    {p.tags.slice(0, 4).map((tag: string, tIdx: number) => (
                      <TagBadge key={tIdx} tag={tag} variant="auto" />
                    ))}
                    {p.tags.length > 4 && (
                      <span className="neo-tag neo-tag-cyan">+{p.tags.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mt-auto items-center">
                  {/* Details Link */}
                  {/* @ts-ignore */}
                  <Link href={`/projects/${p.slug || p.id}`} prefetch transitionTypes={['nav-forward']} className="neo-btn neo-btn-blue text-sm py-1.5 px-3">
                    Details →
                  </Link>
                  
                  {p.github_url && (
                    <a
                      href={p.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-bold text-sm hover:bg-neo-yellow px-1 transition-colors"
                      aria-label={`View ${p.title} repository`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0.5C5.5 0.5 0.5 5.5 0.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6.8 1.6.8.9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.5-.3-5.1-1.2-5.1-5.3 0-1.2.4-2.1 1.1-2.8-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 2.9 1.1.8-.2 1.7-.4 2.6-.4s1.8.1 2.6.4c2-1.4 2.9-1.1 2.9-1.1.6 1.5.2 2.6.1 2.9.7.7 1.1 1.6 1.1 2.8 0 4-2.6 5-5.1 5.3.4.4.8 1 .8 2v3c0 .3.2.7.8.6C20.7 21.4 24 17.1 24 12c0-6.5-5-11.5-12-11.5z" />
                      </svg>
                      <span>Repo</span>
                    </a>
                  )}
                  {p.huggingface_url && (
                    <a
                      href={p.huggingface_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition duration-300 text-sm font-semibold"
                      aria-label={`View ${p.title} live project`}
                    >
                      <SiHuggingface className="w-4 h-4" />
                      <span>Live Project</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty className="acc-blue">
            <Empty.Content>
              <Empty.Icon className="size-10 md:size-12 text-[color:var(--neo-blue)]" />
              <Empty.Title>No Projects Found</Empty.Title>
              <Empty.Separator />
              <Empty.Description>
                No projects are loaded yet. Please check back soon or add some from the console!
              </Empty.Description>
            </Empty.Content>
          </Empty>
        )}
      </section>



      {/* Experience Section — a dark terminal panel that breaks out of the
          page's padded column, same full-bleed trick as the hero. */}
      <section
        id="experience"
        className="fade-in relative isolate ml-[calc(50%-50vw)] w-screen overflow-hidden border-y-2 border-black bg-[#141414] px-4 py-16 sm:px-8 lg:py-24"
        aria-label="Work experience"
        /* This panel is dark in both themes, but globals.css sets a bare
           `h1..h6 { color: var(--neo-ink) }`. That rule is unlayered, so it wins
           over Tailwind's layered utilities and headings came out dark-on-dark
           in light mode. Re-pointing the token locally fixes every descendant. */
        style={{ ['--neo-ink' as string]: '#ffffff' } as React.CSSProperties}
      >
        {/* Faint grid backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(#3f3f46 1px, transparent 1px), linear-gradient(90deg, #3f3f46 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading index="04" label="Experience" title="My Journey" tone="dark" />

          {experiences.length > 0 ? (
            <div className="relative" role="list">
              {experiences.map((exp: any) => {
                const isCurrent = exp.end_date === 'Present'
                return (
                  <div key={String(exp.id)} className="mb-6 flex gap-5 last:mb-0" role="listitem">
                    {/* Timeline rail */}
                    <div
                      className="w-1 shrink-0 bg-neo-yellow"
                      aria-hidden="true"
                    />

                    <div className="flex-1 border-2 border-neo-lime bg-[#1c1c1c] p-6">
                      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-white sm:text-2xl">{exp.title}</h3>
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="bg-neo-lime px-2.5 py-1 font-mono text-xs font-bold text-black">
                              {exp.organization}
                            </span>
                            {exp.location && (
                              <span className="font-mono text-sm text-zinc-500">{exp.location}</span>
                            )}
                          </div>
                        </div>
                        <p className="shrink-0 whitespace-nowrap font-mono text-sm text-[color:var(--neo-yellow)]">
                          {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {' - '}
                          {isCurrent
                            ? 'Present'
                            : new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      {exp.description && (
                        <p className="border-t border-zinc-800 pt-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
                          {exp.description}
                        </p>
                      )}

                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {exp.highlights.map((highlight: string, hIdx: number) => (
                            <li key={hIdx} className="flex items-start gap-3 text-sm text-zinc-400">
                              <span className="mt-0.5 font-bold text-[color:var(--neo-lime)]" aria-hidden="true">
                                &gt;
                              </span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {exp.tags && exp.tags.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {exp.tags.map((tag: string, tIdx: number) => (
                            <TagBadge key={tIdx} tag={tag} variant="terminal" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="border-2 border-zinc-700 bg-[#1c1c1c] p-8 text-center font-mono text-zinc-400">
              No experience logged yet.
            </p>
          )}
        </div>
      </section>

      {/* Blogs Section */}
      <section id="blogs" className="fade-in overflow-visible" aria-label="Blog posts and articles">
        <SectionHeading index="05" label="Blogs" title="Writing" tag="View all posts →" tagHref="/blogs" />

        {blogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible" role="list">
            {blogs.slice(0, 3).map((blog: any) => {
              // Prefer the slug so internal links point at the canonical URL.
              const readUrl = blog.content ? `/blogs/${blog.slug || blog.id}` : (blog.url || '#')
              return (
                <div
                  key={String(blog.id)}
                  className="group neo-card neo-tilt acc-yellow p-6 flex flex-col justify-between"
                  role="listitem"
                  suppressHydrationWarning
                >
                  <ViewTransition name={`blog-card-${blog.id}`} share="auto" default="none">
                    <div className="flex flex-col justify-between h-full w-full">
                      <div>
                        <div className="card-top mb-3 flex items-center justify-between">
                          <span className="card-cat">Article</span>
                          {blog.published_date && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[color:var(--neo-bg-alt)] border border-black px-1.5 py-0.5 rounded text-black shadow-neo-sm">
                              {blog.published_date}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-extrabold group-hover:text-yellow-400 transition duration-300 mb-2">
                          {blog.title}
                        </h3>
                        
                        {blog.summary && (
                          <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">{blog.summary}</p>
                        )}

                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {blog.tags.slice(0, 3).map((tag: string, tIdx: number) => (
                              <TagBadge key={tIdx} tag={tag} variant="auto" />
                            ))}
                            {blog.tags.length > 3 && (
                              <span className="neo-tag neo-tag-cyan">+{blog.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-dashed border-neo-border flex items-center justify-between">
                        <Link
                          href={readUrl}
                          target={blog.content ? undefined : '_blank'}
                          rel={blog.content ? undefined : 'noopener noreferrer'}
                          // @ts-ignore
                          transitionTypes={['nav-forward']}
                          className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition duration-300 text-sm font-semibold"
                          aria-label={`Read ${blog.title}`}
                        >
                          Read Article →
                        </Link>
                      </div>
                    </div>
                  </ViewTransition>
                </div>
              )
            })}
          </div>
        ) : (
          <Empty className="acc-yellow">
            <Empty.Content>
              <Empty.Icon className="size-10 md:size-12 text-[color:var(--neo-yellow)]" />
              <Empty.Title>No Blogs Published Yet</Empty.Title>
              <Empty.Separator />
              <Empty.Description>
                No blogs published yet. Check back soon!
              </Empty.Description>
            </Empty.Content>
          </Empty>
        )}
      </section>



      {/* Bottom Section Grid - Contact & QR Codes Side by Side (lazy-mounted) */}
      <section id="contact" aria-label="Contact">
        <HomeContactQR qrCards={qrCards as any} />
      </section>
    </div>
  )
}
