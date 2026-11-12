import Link from 'next/link';
export function PolicyPage({ title, children }: { title: string; children: React.ReactNode }) {
 return <main id="main-content" className="policy-page"><Link href="/">← Satyam Yatra & Travels</Link><h1>{title}</h1>{children}<p>Questions? Email <a href="mailto:satyambasti9554@gmail.com">satyambasti9554@gmail.com</a> or call <a href="tel:+919628568807">9628568807</a>.</p><Link href="/">Return to the homepage</Link></main>;
}
