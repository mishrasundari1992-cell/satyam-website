import { emailConfigured, handleEnquiry } from '@/lib/enquiry';
export const runtime='nodejs';
export const maxDuration=30;
const environment=()=>({RESEND_API_KEY:process.env.RESEND_API_KEY,EMAIL_FROM:process.env.EMAIL_FROM,UPSTASH_REDIS_REST_URL:process.env.UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN:process.env.UPSTASH_REDIS_REST_TOKEN,LEAD_HASH_SECRET:process.env.LEAD_HASH_SECRET,VERCEL:process.env.VERCEL,SITE_URL:process.env.SITE_URL});
export function GET() { return Response.json({emailAvailable:emailConfigured(environment())},{headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}}); }
export function POST(request: Request) { return handleEnquiry(request,environment()); }
