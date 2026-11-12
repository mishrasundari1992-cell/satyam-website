import { Mail, Phone } from 'lucide-react';
import { whatsapp } from '@/lib/tours';

export function TourContact({ destination }: { destination: string }) {
 return <div className="tour-contact" aria-label={`${destination} travel enquiries`}>
  <a className="tour-whatsapp" href={whatsapp(`${destination} tour package`)} target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.9 11.9 0 0 0 1.8 17.8L.2 23.6l6-1.6A11.9 11.9 0 0 0 24 11.8c0-3.1-1.2-6.1-3.5-8.3ZM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.5.9.9-3.4-.2-.4A9.9 9.9 0 1 1 12 21.8Zm5.4-7.4c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3c.1.2 2 3.2 5 4.5.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z"/></svg> WhatsApp</a>
  <a href="tel:+919628568807"><Phone size={16} aria-hidden="true"/> 9628568807</a>
  <a className="tour-email" href={`mailto:satyambasti9554@gmail.com?subject=${encodeURIComponent(`${destination} tour enquiry`)}`}><Mail size={16} aria-hidden="true"/> satyambasti9554@gmail.com</a>
 </div>;
}
