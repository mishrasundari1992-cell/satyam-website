'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { destinations } from '@/lib/tours';
import { TourContact } from './tour-contact';
export function TourDetails({ destination, onClose }: { destination: (typeof destinations)[number]; onClose: () => void }) {
 const ref = useRef<HTMLDialogElement>(null);
 useEffect(() => {
  const dialog = ref.current;
  const previousOverflow = document.body.style.overflow;
  dialog?.showModal();
  document.body.style.overflow = 'hidden';
  return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
 }, []);
 return <dialog ref={ref} className="destination-modal" aria-labelledby="tour-title" onClose={onClose} onClick={e=>{if(e.target===e.currentTarget) onClose()}}>
  <button className="close-modal" onClick={onClose} aria-label="Close details" autoFocus><X/></button>
  <p className="eyebrow">{destination.state}</p><h2 id="tour-title">{destination.name}</h2><p>{destination.note}</p>
  <p>Start with a suggested {destination.days} journey, tailored to your interests, pickup city, and travel needs. Share your preferences with our team to discuss a detailed itinerary and price.</p>
  {destination.state==='Uttarakhand' && <p>For Himalayan routes, seasonal access and current travel conditions must be checked with official sources before travel.</p>}
  <TourContact destination={destination.name}/>
 </dialog>;
}
