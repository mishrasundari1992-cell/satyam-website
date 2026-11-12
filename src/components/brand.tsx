import Image from 'next/image';
import Link from 'next/link';

export function Brand({ footer = false }: { footer?: boolean }) {
 return <Link href="/" className={`brand brand-image${footer ? ' footer-brand' : ''}`} aria-label="Satyam Yatra & Travels home">
  <Image src="/images/satyam-logo.png" width={2172} height={724} alt="Satyam Tour & Travel — Explore Sacred Destinations. Travel with Trust." sizes={footer ? '240px' : '(max-width: 550px) 190px, 218px'} priority={!footer}/>
 </Link>;
}

