import './globals.css'
import { ReactNode } from 'react'
import { Inter, Anton } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AppSessionProvider from '@/components/SessionProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import DynamicInteractiveBackground from '@/components/DynamicInteractiveBackground'
import CardInteractions from '@/components/CardInteractions'
import ScrollToTop from '@/components/ScrollToTop'
import ScrollProgress from '@/components/ScrollProgress'
import LoadingScreen from '@/components/LoadingScreen'
import type { Metadata } from 'next'
import { profile } from '@/lib/profile'

// Font config
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  weight: ['400', '500', '600', '700'],
  fallback: ['system-ui', 'arial'],
})

// Display face for the hero name — an ultra-condensed heavy grotesque.
// next/font self-hosts this at build time, so there is no runtime request
// to Google and no extra render-blocking round trip.
const anton = Anton({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-anton',
  preload: true,
  weight: ['400'],
  fallback: ['Impact', 'Haettenschweiler', 'sans-serif'],
})

// SEO metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://alihamzasultan.vercel.app'),
  title: {
    default: `${profile.name} | Portfolio`,
    template: `%s | ${profile.name}`,
  },
  description: profile.bio,
  keywords: [
    'AI Engineer',
    'Machine Learning',
    'Deep Learning',
    'Full-Stack Developer',
    profile.name,
    'Artificial Intelligence',
    'Data Science',
    'Model Optimization',
    'AI Solutions',
    'Next.js',
    'React',
    'TypeScript',
    'Python',
    'TensorFlow',
    'PyTorch',
  ],
  authors: [{ name: profile.name, url: 'https://alihamzasultan.vercel.app' }],
  creator: profile.name,
  publisher: profile.name,
  
  // Social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://alihamzasultan.vercel.app',
    title: `${profile.name} | ${profile.title}`,
    description: profile.bio,
    siteName: `${profile.name} Portfolio`,
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: `${profile.name} Portfolio`,
      },
    ],
  },

  // Twitter card
  twitter: {
    card: 'summary_large_image',
    title: `${profile.name} | ${profile.title}`,
    description: profile.bio,
    images: ['/web-app-manifest-512x512.png'],
    creator: `@${profile.name.toLowerCase()}`,
  },

  // Canonical
  alternates: {
    canonical: 'https://alihamzasultan.vercel.app',
  },

  // SEO robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // iOS settings
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: profile.name,
  },

  // Auto-detection settings
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Category
  category: 'technology',
}

// Viewport config
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Charset meta - must be first */}
        <meta charSet="utf-8" />

        {/* Favicons — full cross-platform set (RealFaviconGenerator).
            ?v=2 busts the browser's aggressive favicon cache. */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png?v=3" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
        <link rel="manifest" href="/site.webmanifest?v=3" />

        {/* Theme initialization - prevent flash */}
        <script src="/theme-init.js" />
        
        {/* Essential meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        {/* Windows tiles */}
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#fdf3e3" />

        {/* Preconnect to external services */}
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Person Schema - SEO Structured Data */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: profile.name,
              url: 'https://alihamzasultan.vercel.app',
              jobTitle: profile.title,
              description: profile.bio,
              sameAs: [
                profile.socialLinks.github,
                profile.socialLinks.linkedin,
                profile.socialLinks.x,
              ].filter(Boolean),
              address: {
                '@type': 'PostalAddress',
                addressLocality: profile.location.split(',')[0].trim(),
                addressCountry: profile.location.split(',').pop()?.trim() || '',
              },
              email: profile.email,
              telephone: profile.phone,
              image: 'https://alihamzasultan.vercel.app/web-app-manifest-512x512.png',
              workLocation: {
                '@type': 'Place',
                name: 'Remote',
              },
            }),
          }}
        />

        {/* Organization Schema - SEO Structured Data */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: `${profile.name} Portfolio`,
              url: 'https://alihamzasultan.vercel.app',
              logo: 'https://alihamzasultan.vercel.app/web-app-manifest-512x512.png',
              sameAs: [
                profile.socialLinks.github,
                profile.socialLinks.linkedin,
              ].filter(Boolean),
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'General',
                email: profile.email,
                telephone: profile.phone,
              },
            }),
          }}
        />

        {/* WebSite Schema with SearchAction - SEO */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: 'https://alihamzasultan.vercel.app',
              name: `${profile.name} Portfolio`,
              description: `${profile.name} AI and Full-Stack Engineer Portfolio`,
              inLanguage: 'en-US',
              creator: {
                '@type': 'Person',
                name: profile.name,
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} ${anton.variable} antialiased`}>
        <LoadingScreen />
        <ScrollProgress />
        <ThemeProvider>
        <AppSessionProvider>
          <DynamicInteractiveBackground />
          <CardInteractions />
          <Header />
          <ScrollToTop />
          <main id="main-content" className="relative z-10 pt-20 pb-0 min-h-screen" role="main" aria-label="Main content">
            <div className="w-full max-w-none md:max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
              {children}
            </div>
          </main>
          <Footer />
        </AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

