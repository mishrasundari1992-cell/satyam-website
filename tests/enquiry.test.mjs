import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { handleEnquiry, notification, validateLead } from '../src/lib/enquiry.ts';
const env={RESEND_API_KEY:'test-not-a-live-key',EMAIL_FROM:'Satyam <test@example.com>',UPSTASH_REDIS_REST_URL:'https://redis.example.test',UPSTASH_REDIS_REST_TOKEN:'test-not-a-live-token',LEAD_HASH_SECRET:'test-only-hash-secret-32-characters-long'};
const lead={name:'Test Traveler',mobile:'9628568807',email:'traveler@example.com',destination:'Ayodhya',travelers:4,date:'2027-02-10',pickup:'Basti',requirements:'Family trip',consent:true,website:''};
const request=(body,headers={})=>new Request('http://localhost:3000/api/enquiry',{method:'POST',headers:{Origin:'http://localhost:3000','Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
function services({failEmail=false,failRedis=false,failReceipt=false}={}) {
 const records=new Map();const counts=new Map();const sends=[];
 const fetcher=async (url,init)=>{
  if(url==='https://api.resend.com/emails'){
   sends.push({body:JSON.parse(init.body),key:init.headers['Idempotency-Key']});
   return Response.json(failEmail?{error:'provider-error'}:{id:'test-provider-id'},{status:failEmail?500:200});
  }
  if(failRedis)throw new Error('Redis unavailable');
  const command=JSON.parse(init.body);
  if(command[0]==='SET') {if(failReceipt)throw new Error('Receipt unavailable');records.set(command[1],command[2]);return Response.json({result:'OK'});}
  if(command[1].startsWith('local a=')){
   const a=(counts.get(command[3])||0)+1,b=(counts.get(command[4])||0)+1;counts.set(command[3],a);counts.set(command[4],b);return Response.json({result:a>10||b>5?0:1});
  }
  const value=records.get(command[3])||command[4];records.set(command[3],value);return Response.json({result:value});
 };
 return {fetcher,sends,records};
}
test('normalizes fields and rejects invalid phone, email, travelers, date, consent and honeypot',()=>{
 assert.equal(validateLead({...lead,mobile:'+91 (96285) 68807',email:' TRAVELER@EXAMPLE.COM '}).mobile,'+919628568807');
 for(const invalid of [{mobile:'123'},{email:'bad'},{email:'a@example.com\r\nBcc:x@example.com'},{travelers:0},{travelers:1.5},{travelers:true},{date:'2027-02-30'},{consent:false},{website:'spam'},{name:' '}]) assert.throws(()=>validateLead({...lead,...invalid}));
});
test('email template contains all fields, consent, India timestamp and escaped HTML',()=>{
 const email=notification(validateLead({...lead,name:'<script>alert(1)</script>',requirements:'<img src=x onerror=alert(1)>'}),'2026-11-12T06:00:00Z','ABC123');
 assert.ok(email.html.includes('&lt;script&gt;'));assert.ok(!email.html.includes('<script>'));assert.ok(email.html.includes('India time'));assert.ok(email.text.includes('Basti'));assert.ok(email.text.includes('Agreed'));assert.ok(email.text.includes('ABC123'));
});
test('rejects cross-origin, malformed, non-JSON and oversized submissions before providers',async()=>{
 const s=services();
 assert.equal((await handleEnquiry(request({...lead,requestId:randomUUID()},{Origin:'https://spam.example'}),env,s.fetcher)).status,403);
 assert.equal((await handleEnquiry(request('{'),env,s.fetcher)).status,400);
 assert.equal((await handleEnquiry(request('a=1',{'Content-Type':'text/plain'}),env,s.fetcher)).status,415);
 assert.equal((await handleEnquiry(request('x'.repeat(12001)),env,s.fetcher)).status,413);assert.equal(s.sends.length,0);
});
test('missing credentials fails clearly without reporting success or contacting providers',async()=>{
 const response=await handleEnquiry(request({...lead,requestId:randomUUID()}),{});
 assert.equal(response.status,503);assert.equal((await response.json()).ok,false);
});
test('same-origin requests work when Next normalizes the local request URL',async()=>{
 const response=await handleEnquiry(request({...lead,requestId:randomUUID()},{Host:'127.0.0.1:3000',Origin:'http://127.0.0.1:3000'}),{});
 assert.equal(response.status,503);
});
test('valid submission notifies only the business email and duplicate retry sends once',async()=>{
 const s=services();const body={...lead,requestId:randomUUID()};
 for(let i=0;i<2;i++){const response=await handleEnquiry(request(body),env,s.fetcher);assert.equal(response.status,200);assert.equal((await response.json()).ok,true);}
 assert.equal(s.sends.length,1);assert.deepEqual(s.sends[0].body.to,['satyambasti9554@gmail.com']);assert.equal(s.sends[0].body.reply_to,'traveler@example.com');assert.ok(s.sends[0].key.startsWith('yatra/'));
 const stored=JSON.stringify([...s.records.values()]);assert.ok(!stored.includes(lead.email));assert.ok(!stored.includes(lead.name));
});
test('provider failure never yields a success result',async()=>{
 const s=services({failEmail:true});const response=await handleEnquiry(request({...lead,requestId:randomUUID()}),env,s.fetcher);
 assert.equal(response.status,502);assert.equal((await response.json()).ok,false);
});
test('retry after provider error uses identical payload and idempotency key',async()=>{
 const s=services({failEmail:true});const body={...lead,requestId:randomUUID()};
 await handleEnquiry(request(body),env,s.fetcher);await handleEnquiry(request(body),env,s.fetcher);assert.deepEqual(s.sends[0],s.sends[1]);
});
test('receipt failure after acceptance does not falsely report email failure',async()=>{
 const s=services({failReceipt:true});const body={...lead,requestId:randomUUID()};
 assert.equal((await handleEnquiry(request(body),env,s.fetcher)).status,200);
 assert.equal((await handleEnquiry(request(body),env,s.fetcher)).status,200);
 assert.deepEqual(s.sends[0],s.sends[1]);
});
test('same request ID with changed details is rejected',async()=>{
 const s=services();const body={...lead,requestId:randomUUID()};await handleEnquiry(request(body),env,s.fetcher);
 assert.equal((await handleEnquiry(request({...body,travelers:5}),env,s.fetcher)).status,409);assert.equal(s.sends.length,1);
});
test('shared rate limiter prevents excessive email submissions',async()=>{
 const s=services();for(let i=0;i<5;i++)assert.equal((await handleEnquiry(request({...lead,requestId:randomUUID()}),env,s.fetcher)).status,200);
 const response=await handleEnquiry(request({...lead,requestId:randomUUID()}),env,s.fetcher);assert.equal(response.status,429);assert.equal(response.headers.get('Retry-After'),'900');assert.equal(s.sends.length,5);
});
test('rate limiting failure is closed, not an unprotected email send',async()=>{
 const s=services({failRedis:true});assert.equal((await handleEnquiry(request({...lead,requestId:randomUUID()}),env,s.fetcher)).status,503);assert.equal(s.sends.length,0);
});
