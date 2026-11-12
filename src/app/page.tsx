import Home from '@/components/home';
import type { Metadata } from 'next';
export const metadata: Metadata = { alternates: { canonical: '/' }, openGraph: { title: 'Satyam Yatra & Travels | Explore Sacred India', description: 'Personalized pilgrimage planning across Uttar Pradesh and Uttarakhand.', url: '/' } };
export default function Page() { return <Home/>; }
