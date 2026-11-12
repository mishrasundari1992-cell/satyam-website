import { createHmac } from 'node:crypto';

export const leadRecipient = 'satyambasti9554@gmail.com';
export type EnquiryEnv = { RESEND_API_KEY?: string; EMAIL_FROM?: string; UPSTASH_REDIS_REST_URL?: string; UPSTASH_REDIS_REST_TOKEN?: string; LEAD_HASH_SECRET?: string; VERCEL?: string; SITE_URL?: string };
export type Lead = { name: string; mobile: string; email: string; destination: string; travelers: number; date: string; pickup: string; requirements: string; consent: true };
type Receipt = { fingerprint: string; createdAt: string; accepted?: boolean };
class EnquiryError extends Error { status: number; constructor(status: number, message: string) { super(message); this.status=status; } }
const json = (body: object, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...(status===429 ? {'Retry-After':'900'} : {}) } });
export function emailConfigured(env: EnquiryEnv) {
 return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM && !/[\r\n]/.test(env.EMAIL_FROM) && env.UPSTASH_REDIS_REST_URL?.startsWith('https://') && env.UPSTASH_REDIS_REST_TOKEN && env.LEAD_HASH_SECRET && env.LEAD_HASH_SECRET.length >= 32);
}
function field(value: unknown, label: string, max: number, required = false) {
 if (typeof value !== 'string') { if (required) throw new EnquiryError(400, `${label} is required.`); return ''; }
 const result = value.normalize('NFC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').trim();
 if ((required && !result) || result.length > max) throw new EnquiryError(400, `Please check ${label.toLowerCase()}.`);
 return result;
}
export function validateLead(input: Record<string, unknown>): Lead {
 if (input.website) throw new EnquiryError(400, 'Please try again or contact us directly.');
 const name=field(input.name,'Full name',100,true);
 const mobile=field(input.mobile,'Mobile number',22,true).replace(/[\s()-]/g,'');
 const email=field(input.email,'Email address',254,true).toLowerCase();
 const destination=field(input.destination,'Destination',100,true);
 const travelers=(typeof input.travelers==='number'||typeof input.travelers==='string')?Number(input.travelers):NaN;
 const date=field(input.date,'Travel date',10);
 if (name.length<2 || /[\r\n]/.test(name)) throw new EnquiryError(400,'Please enter your full name.');
 if (!/^\+?[1-9]\d{9,14}$/.test(mobile)) throw new EnquiryError(400,'Please enter a valid mobile number with 10–15 digits.');
 if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new EnquiryError(400,'Please enter a valid email address.');
 if (!Number.isInteger(travelers)||travelers<1||travelers>100) throw new EnquiryError(400,'Choose between 1 and 100 travelers.');
 if (input.consent!==true) throw new EnquiryError(400,'Please agree to the privacy consent.');
 if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date)) throw new EnquiryError(400,'Please enter a valid travel date.');
 return {name,mobile,email,destination,travelers,date,pickup:field(input.pickup,'Pickup city',100),requirements:field(input.requirements,'Special requirements',1000),consent:true};
}
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function notification(lead: Lead, createdAt: string, reference: string) {
 const timestamp=new Date(createdAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'});
 const rows=[['Name',lead.name],['Mobile',lead.mobile],['Email',lead.email],['Destination / package',lead.destination],['Travelers',String(lead.travelers)],['Travel date',lead.date||'Flexible'],['Pickup city',lead.pickup||'To discuss'],['Special requirements',lead.requirements||'None specified'],['Privacy consent','Agreed'],['Submitted (India time)',timestamp],['Reference',reference]];
 return {
  subject: `New yatra enquiry — ${lead.destination.replace(/[\r\n]/g,' ')} — ${reference}`,
  text: `Satyam Yatra & Travels\nNew travel enquiry\n\n${rows.map(([key,value])=>`${key}: ${value}`).join('\n')}\n\nThis is an enquiry, not a confirmed booking.`,
  html: `<div style="background:#fff9f0;padding:28px;font-family:Arial,sans-serif;color:#14263d"><div style="max-width:620px;margin:auto;background:#fff;border-top:5px solid #e87524;padding:28px"><p style="color:#e87524;letter-spacing:2px;font-size:12px">SATYAM YATRA & TRAVELS</p><h1 style="font-family:Georgia,serif;font-size:28px">A new journey begins here</h1><p>A visitor has requested a customized travel proposal.</p><table style="border-collapse:collapse;width:100%">${rows.map(([key,value])=>`<tr><th style="text-align:left;vertical-align:top;padding:12px 8px;border-bottom:1px solid #eee">${escapeHtml(key)}</th><td style="padding:12px 8px;border-bottom:1px solid #eee;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`).join('')}</table><p style="font-size:12px;color:#68717d">Reply to this email to contact the traveler. This enquiry does not confirm a booking.</p></div></div>`,
 };
}
async function readBody(request: Request) {
 if (!request.headers.get('content-type')?.includes('application/json')) throw new EnquiryError(415,'Please submit the website enquiry form.');
 if (Number(request.headers.get('content-length'))>12000) throw new EnquiryError(413,'The enquiry is too large.');
 const reader=request.body?.getReader(); if(!reader) throw new EnquiryError(400,'The enquiry is empty.');
 let size=0; const chunks: Uint8Array[]=[];
 while(true) { const {done,value}=await reader.read(); if(done) break;size+=value.byteLength;if(size>12000){await reader.cancel();throw new EnquiryError(413,'The enquiry is too large.');}chunks.push(value); }
 try { const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!body||typeof body!=='object'||Array.isArray(body))throw new Error();return body as Record<string,unknown>; } catch {throw new EnquiryError(400,'Please check your enquiry details.');}
}
export async function handleEnquiry(request: Request, env: EnquiryEnv, fetcher: typeof fetch = fetch) {
 try {
  const origin=request.headers.get('origin');
  const requestUrl=new URL(request.url);
  const allowed=[requestUrl.origin];
  // Next's local server can normalize request.url to localhost while the browser uses 127.0.0.1.
  // Host is the actual browser-facing origin; never accept a client-supplied forwarded host here.
  const host=request.headers.get('host');
  if(host)allowed.push(new URL(`${requestUrl.protocol}//${host}`).origin);
  if(env.SITE_URL) allowed.push(new URL(env.SITE_URL).origin);
  if(!origin||!allowed.includes(origin)||request.headers.get('sec-fetch-site')==='cross-site') throw new EnquiryError(403,'Please send your enquiry from this website.');
  const body=await readBody(request);
  const lead=validateLead(body);
  if(typeof body.requestId!=='string'||!(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i).test(body.requestId)) throw new EnquiryError(400,'Please refresh the form and try again.');
  if(!emailConfigured(env)) throw new EnquiryError(503,'Email enquiries are temporarily unavailable. Please send your details on WhatsApp or call 9628568807.');
  const hash=(value:string)=>createHmac('sha256',env.LEAD_HASH_SECRET!).update(value).digest('hex');
  const redis=async (command: (string|number)[]) => {
   const response=await fetcher(env.UPSTASH_REDIS_REST_URL!,{method:'POST',headers:{Authorization:`Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(6000),cache:'no-store'});
   if(!response.ok) throw new EnquiryError(503,'We could not safely submit your enquiry. Please try again or use WhatsApp.');
   const result=await response.json();if(result.error)throw new EnquiryError(503,'Please try again or use WhatsApp.');return result.result;
  };
  const ip=env.VERCEL ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() : 'local';
  if(env.VERCEL&&!ip)throw new EnquiryError(503,'Please try again or use WhatsApp.');
  const rateScript="local a=redis.call('INCR',KEYS[1]);if a==1 then redis.call('EXPIRE',KEYS[1],900) end;local b=redis.call('INCR',KEYS[2]);if b==1 then redis.call('EXPIRE',KEYS[2],900) end;if a>10 or b>5 then return 0 end;return 1";
  const allowedRate=await redis(['EVAL',rateScript,2,`lead:ip:${hash(ip!)}`,`lead:email:${hash(lead.email)}`]);
  if(allowedRate!==1) throw new EnquiryError(429,'Too many enquiries. Please wait 15 minutes, or contact us on WhatsApp.');
  const fingerprint=hash(JSON.stringify(lead));
  const key=`lead:submission:${hash(body.requestId)}`;
  const newReceipt: Receipt={fingerprint,createdAt:new Date().toISOString()};
  const receipt: Receipt=JSON.parse(await redis(['EVAL',"local v=redis.call('GET',KEYS[1]);if v then return v end;redis.call('SET',KEYS[1],ARGV[1],'EX',86400);return ARGV[1]",1,key,JSON.stringify(newReceipt)]));
  if(receipt.fingerprint!==fingerprint)throw new EnquiryError(409,'Your details have changed. Please submit a new enquiry.');
  const reference=hash(body.requestId).slice(0,12).toUpperCase();
  if(receipt.accepted) return json({ok:true,reference,message:'Your enquiry was accepted for email notification. We will review your travel details. This does not confirm a booking.'});
  const email=notification(lead,receipt.createdAt,reference);
  const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`yatra/${hash(body.requestId)}`},body:JSON.stringify({from:env.EMAIL_FROM,to:[leadRecipient],reply_to:lead.email,...email}),signal:AbortSignal.timeout(12000),cache:'no-store'});
  const delivery=await response.json();
  if(!response.ok||typeof delivery.id!=='string')throw new EnquiryError(502,'Email submission could not be confirmed. Please retry with the same details, or send your enquiry on WhatsApp.');
  // Success is based on provider acceptance, not inbox delivery. Persisting the receipt is best-effort;
  // retries retain the same provider idempotency key even if this update fails.
  try { await redis(['SET',key,JSON.stringify({...receipt,accepted:true}),'EX',86400]); } catch { /* Provider acceptance has already succeeded. Do not misreport it as a failure. */ }
  return json({ok:true,reference,message:'Your enquiry was accepted for email notification. We will review your travel details. This does not confirm a booking.'});
 } catch(error) {
  if(error instanceof EnquiryError)return json({ok:false,message:error.message},error.status);
  return json({ok:false,message:'Submission could not be confirmed. Please retry or contact us on WhatsApp.'},503);
 }
}
