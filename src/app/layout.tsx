import type { Metadata } from 'next';
import './globals.css';
import { siteUrl, indexable } from '@/lib/site';
export const metadata: Metadata = {
 metadataBase: new URL(siteUrl),
 title: { default: 'Satyam Yatra & Travels | Sacred Journeys in UP & Uttarakhand', template: '%s | Satyam Yatra & Travels' },
 description: 'Plan a personalized pilgrimage to Ayodhya, Varanasi, Haridwar, Rishikesh and Char Dham. Explore sacred destinations. Travel with trust.',
 robots: { index: indexable, follow: indexable },
 openGraph: { type: 'website', locale: 'en_IN', siteName: 'Satyam Yatra & Travels', images: [{ url: '/images/varanasi.webp', width: 1920, height: 1280, alt: 'Varanasi ghats and boats beside the sacred Ganga at golden hour' }] },
 twitter: { card: 'summary_large_image' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a>{children}</body></html>; }
