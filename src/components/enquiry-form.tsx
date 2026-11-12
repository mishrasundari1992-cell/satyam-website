'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, LoaderCircle, MessageCircle } from 'lucide-react';
import { destinations } from '@/lib/tours';

export function EnquiryForm() {
 const [emailAvailable,setEmailAvailable]=useState(false);
 const [status,setStatus]=useState<'idle'|'sending'|'success'|'error'>('idle');
 const [message,setMessage]=useState('');
 const pending=useRef(false);
 const last=useRef<{payload:string;id:string}|null>(null);
 useEffect(()=>{const controller=new AbortController();fetch('/api/enquiry',{signal:controller.signal,cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>setEmailAvailable(data?.emailAvailable===true)).catch(()=>{});return()=>controller.abort();},[]);
 async function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if(pending.current)return;
  const form=event.currentTarget;
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const lead={name:String(data.get('name')||'').trim(),mobile:String(data.get('mobile')||'').trim(),email:String(data.get('email')||'').trim(),destination:String(data.get('destination')||''),travelers:Number(data.get('travelers')),date:String(data.get('date')||''),pickup:String(data.get('pickup')||'').trim(),requirements:String(data.get('requirements')||'').trim(),consent:data.get('consent')==='on',website:String(data.get('website')||'')};
  if(lead.name.length<2||!/^\+?[1-9]\d{9,14}$/.test(lead.mobile.replace(/[\s()-]/g,''))){setStatus('error');setMessage('Please enter your full name and a valid mobile number with 10–15 digits.');return;}
  const channel=(event.nativeEvent as SubmitEvent).submitter?.getAttribute('value')|| (emailAvailable?'email':'whatsapp');
  if(channel==='whatsapp') {
   const text=`Namaste! I would like a travel quote.\nName: ${lead.name}\nMobile: ${lead.mobile}\nEmail: ${lead.email}\nDestination: ${lead.destination}\nTravelers: ${lead.travelers}\nTravel date: ${lead.date||'Flexible'}\nPickup city: ${lead.pickup||'To discuss'}\nSpecial requirements: ${lead.requirements||'None specified'}\nPrivacy consent: Agreed`;
   setStatus('idle');setMessage('Continue in WhatsApp and tap Send to deliver your enquiry.');
   // Same-tab navigation avoids popup blockers. Opening WhatsApp does not prove a message was sent.
   window.location.assign(`https://wa.me/919628568807?text=${encodeURIComponent(text)}`);
   return;
  }
  pending.current=true;setStatus('sending');setMessage('Submitting your enquiry…');
  try {
   const payload=JSON.stringify(lead);
   if(!last.current||last.current.payload!==payload)last.current={payload,id:crypto.randomUUID()};
   const response=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...lead,requestId:last.current.id}),signal:AbortSignal.timeout(25000)});
   const result=await response.json();
   if(!response.ok||result.ok!==true)throw new Error(typeof result.message==='string'?result.message:'Please try again or use WhatsApp.');
   setStatus('success');setMessage(`${result.message} Reference: ${result.reference}.`);
  } catch(error) {
   setStatus('error');setMessage(error instanceof Error&&error.name==='Error'?error.message:'Submission could not be confirmed. Please retry with the same details, or send on WhatsApp.');
  } finally { pending.current=false; }
 }
 return <form className="enquiry-form" action="/api/enquiry" method="post" onSubmit={submit} onChange={()=>{if(status==='success'){setStatus('idle');setMessage('');}}}>
  <h3>Where will faith take you?</h3><p>Share your plans with our travel team.</p>
  <div className="form-grid"><label>Full name *<input name="name" autoComplete="name" placeholder="Your name" required minLength={2} maxLength={100}/></label><label>Mobile number *<input name="mobile" type="tel" autoComplete="tel" inputMode="tel" pattern="[+0-9 ()-]{10,22}" placeholder="Your mobile number" required maxLength={22}/></label><label>Email address *<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254}/></label><label>Destination / package *<select name="destination" required defaultValue=""><option value="">Choose your destination</option>{destinations.map(d=><option key={d.name}>{d.name}</option>)}<option>Custom pilgrimage</option></select></label><label>Number of travelers *<input name="travelers" type="number" min="1" max="100" step="1" placeholder="e.g. 4" required/></label><label>Travel date<input name="date" type="date"/></label><label className="full-field">Pickup city<input name="pickup" placeholder="Where would you like to start?" maxLength={100}/></label><label className="full-field">Special requirements<textarea name="requirements" placeholder="Anything we should know about your journey?" maxLength={1000} rows={2}/></label></div>
  <div className="form-trap" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
  <label className="consent"><input type="checkbox" name="consent" required/> <span>I agree to the <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">privacy policy</a> and to sharing these details with Satyam Yatra & Travels to respond to my enquiry.</span></label>
  <p className={`form-status ${status}`} role={status==='error'?'alert':'status'} aria-live="polite">{message}</p>
  <button className="button" type="submit" name="channel" value={emailAvailable?'email':'whatsapp'} disabled={status==='sending'||status==='success'}>{status==='sending'?<><LoaderCircle size={17} className="spin"/>Submitting…</>:status==='success'?'Enquiry submitted':emailAvailable?<>Send My Enquiry <ArrowUpRight size={18}/></>:<>Send Enquiry on WhatsApp <MessageCircle size={18}/></>}</button>
  {emailAvailable&&<button className="button whatsapp-form-button" type="submit" name="channel" value="whatsapp" disabled={status==='sending'}><MessageCircle size={17}/> Send on WhatsApp instead</button>}
  <small className="form-note">{emailAvailable?'Email acceptance does not confirm a booking. For WhatsApp, review the message and tap Send.':'Continue to WhatsApp, then tap Send to deliver your enquiry. Email submission is currently unavailable.'} You can also call <a href="tel:+919628568807">9628568807</a> or <a href="mailto:satyambasti9554@gmail.com">email us directly</a>.</small>
 </form>;
}
