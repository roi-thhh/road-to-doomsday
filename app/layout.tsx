import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Road to Doomsday | Couples MCU Watch Progress Tracker',
  description: 'High-fidelity neo-brutalist MCU watch progress tracker for couples preparing for Avengers: Doomsday (Dec 18, 2026). Sync your watch order with your partner!',
  keywords: ['MCU', 'Avengers Doomsday', 'Couples Watch Tracker', 'Marvel Cinematic Universe', 'Doctor Doom', 'Multiverse Saga'],
  authors: [{ name: 'Avengers Watch Sync' }],
  openGraph: {
    title: 'Road to Doomsday | Couples MCU Watch Tracker',
    description: 'Track and sync your MCU watch progress with your partner before Avengers: Doomsday!',
    type: 'website',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neo-dark text-black antialiased selection:bg-neo-yellow selection:text-black">
        {children}
      </body>
    </html>
  );
}
