import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = 'https://doomsdayraodmap.me';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFE81F' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0C0C' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Road to Doomsday | Ultimate MCU Watch Order & Avengers: Doomsday Roadmap',
    template: '%s | Road to Doomsday',
  },
  description:
    'Track, sync, and prepare for Avengers: Doomsday (2026). The definitive Marvel Cinematic Universe (MCU) chronological & release order watch guide, complete with real-time partner sync, Doomsday essentials filter, and live release countdown.',
  applicationName: 'Road to Doomsday',
  authors: [
    {
      name: 'Rohith Das',
      url: 'https://www.instagram.com/roith.hhh?igsh=MWdmNHk2NXpmNjZ6Mg==',
    },
  ],
  generator: 'Next.js',
  keywords: [
    'Avengers Doomsday',
    'Avengers Doomsday watch order',
    'MCU watch order',
    'Marvel movies in order',
    'Road to Doomsday',
    'Doomsday roadmap',
    'MCU chronological order',
    'MCU release order tracker',
    'Doctor Doom MCU',
    'Robert Downey Jr Doctor Doom',
    'Avengers Doomsday countdown',
    'Couples MCU watch tracker',
    'Partner movie sync tracker',
    'Doomsday essentials watch list',
    'Marvel Multiverse Saga order',
    'MCU Phase 1 to Phase 6 timeline',
    'Fantastic Four First Steps watch guide',
    'Secret Wars roadmap',
    'Marvel series watch order',
    'Loki TVA timeline tracker',
    'Marvel Cinematic Universe timeline',
  ],
  creator: 'Rohith Das',
  publisher: 'Rohith Das',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-US': siteUrl,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Road to Doomsday',
    title: 'Road to Doomsday | Ultimate MCU Watch Order & Avengers: Doomsday Roadmap',
    description:
      'The definitive neo-brutalist Marvel Cinematic Universe watch timeline tracker. Filter by Doomsday Essentials, switch between Chronological & Release orders, and sync watch progress live with your partner!',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Road to Doomsday - Avengers Doomsday MCU Watch Order Tracker',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Road to Doomsday | Ultimate MCU Watch Order & Avengers: Doomsday Roadmap',
    description:
      'Prepare for Avengers: Doomsday (2026)! Track the full MCU timeline in Chronological & Release Order with real-time partner sync and Doomsday essentials filter.',
    images: ['/opengraph-image'],
    creator: '@roith_hhh',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  category: 'entertainment',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#webapp`,
      name: 'Road to Doomsday - Avengers Doomsday MCU Watch Order Tracker',
      url: siteUrl,
      description:
        'High-fidelity neo-brutalist Marvel Cinematic Universe (MCU) watch progress tracker for couples and fans preparing for Avengers: Doomsday (2026). Real-time partner sync, chronological and release order filters.',
      applicationCategory: 'EntertainmentApplication',
      operatingSystem: 'All',
      inLanguage: 'en-US',
      author: {
        '@type': 'Person',
        name: 'Rohith Das',
        url: 'https://www.instagram.com/roith.hhh?igsh=MWdmNHk2NXpmNjZ6Mg==',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Road to Doomsday',
      description: 'The Ultimate MCU Watch Order Guide & Roadmap to Avengers: Doomsday',
      publisher: {
        '@type': 'Person',
        name: 'Rohith Das',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the best order to watch the MCU before Avengers: Doomsday?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can watch the Marvel Cinematic Universe in two main orders on Road to Doomsday: (1) Release Order to experience the movies as they premiered in theaters, or (2) Chronological Order to follow the in-universe timeline from Captain America: The First Avenger through the Multiverse Saga.',
          },
        },
        {
          '@type': 'Question',
          name: 'What MCU movies are essential for Avengers: Doomsday?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Key essential movies and series leading into Avengers: Doomsday include: Avengers: Endgame, Loki (Seasons 1 & 2), Spider-Man: No Way Home, Doctor Strange in the Multiverse of Madness, Ant-Man and the Wasp: Quantumania, Deadpool & Wolverine, Captain America: Brave New World, Thunderbolts*, and The Fantastic Four: First Steps.',
          },
        },
        {
          '@type': 'Question',
          name: 'When is the release date for Avengers: Doomsday?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Avengers: Doomsday is scheduled for global theatrical release in May 2026, featuring Robert Downey Jr. as Victor Von Doom / Doctor Doom.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does couple partner watch sync work on Road to Doomsday?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Create an account, copy your unique Sync ID, and send a partner invite to your partner email or ID. Once linked, watch statuses update in real time on both screens, showing individual completion percentages and shared milestone badges.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-neo-dark text-black antialiased selection:bg-neo-yellow selection:text-black">
        {children}
      </body>
    </html>
  );
}
