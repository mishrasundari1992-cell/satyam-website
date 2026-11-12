# Enquiry delivery setup

## Current behavior

Without the complete server configuration, the form offers WhatsApp. It takes the visitor to `https://wa.me/919628568807` with every enquiry field encoded in the message. The visitor must tap **Send**. Opening WhatsApp alone is never reported as a delivered lead.

When email configuration is present, the form enables **Send My Enquiry**, with WhatsApp as a separate fallback. The server validates and sanitizes details and consent, checks same-origin requests, a honeypot, bounded request size, shared rate limits, and submission idempotency before notifying **satyambasti9554@gmail.com**. This address is fixed server-side, not taken from visitor input. The visitor's email is the Reply-To.

Success means the provider accepted the notification, not that Gmail delivered it to the inbox. An error or timeout keeps form entries available for retry. Retrying unchanged details on the same page uses the same request ID and provider idempotency key; duplicate accepted submissions are returned without another send. Do not refresh the page during a retry. No payment or booking is confirmed.

## Configure production

1. Create a Resend account and verify a sender domain you own. Do not use the visitor's email or an unverified Gmail address as the sender. Follow Resend's DNS instructions for SPF and DKIM. Add a DMARC record consistent with your domain's email policies; start with monitoring if you are unsure of existing senders. Confirm verification in the provider dashboard.
2. Create an Upstash Redis database (or add it through Vercel's marketplace). Copy the REST URL and Standard token into **server-only** Vercel environment variables. The read-only token cannot enforce rate limits or record receipts.
3. Add these values in Vercel Project → Settings → Environment Variables for the intended environment:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | Your restricted sending API key |
| `EMAIL_FROM` | A sender on the verified domain, such as `Satyam Yatra <enquiries@your-verified-domain>` |
| `UPSTASH_REDIS_REST_URL` | The HTTPS Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Its server-side Standard token |
| `LEAD_HASH_SECRET` | A random secret of at least 32 characters |
| `SITE_URL` | Final production HTTPS origin |

Do not place secrets in `NEXT_PUBLIC_*`, the repository, screenshots, or chat. `.env.example` contains empty placeholders only. Use `.env.local` for local development. Generate the hash secret with a password manager or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in your private terminal.

4. Redeploy after setting environment values. The availability endpoint only confirms configuration is present; it does not prove the credentials, DNS, quota, or inbox delivery work.
5. On the actual production domain, submit an identifiable test enquiry using your own contact details. Check the success reference, the Resend event dashboard, and **satyambasti9554@gmail.com**, including Spam. Confirm all fields and the timestamp, then test Reply-To.
6. Click once, then retry a simulated timeout with the same details. Verify only one provider message is created. Check that an API failure does not show success and that WhatsApp remains usable. Do not intentionally exhaust the public rate limit while real visitors are using the site.
7. Monitor failed/bounced emails and provider quota in Resend. Configure provider delivery alerts or signed webhooks as a later monitoring integration. Keep the phone and WhatsApp options available.

## Safeguards and retention

- Rate limits: 10 attempts per IP and 5 per email per 15 minutes. On Vercel, client IP comes from trusted platform headers. For another host, implement trusted client-IP extraction before deployment; otherwise requests share a conservative local bucket.
- Redis stores HMAC fingerprints, rate counters, timestamps and acceptance receipts, not full lead details, raw IP addresses, names, or email addresses. Rate keys expire after 15 minutes; receipts after 24 hours. Protect the hashing secret and rotate only with an appropriate deployment plan.
- Provider idempotency is also used for 24 hours. A Redis failure before sending fails closed; a receipt update failure after provider acceptance does not falsely report an unsuccessful email. Retry payload timestamps remain stable.
- Full enquiry details exist in the email provider and business mailbox. Review retention/access with the business owner and update the privacy policy if the process changes.
- No raw lead data or provider error responses are logged by the handler, and no personal details are sent to analytics.
- Automated tests use injected mock providers, not real emails. Live inbox delivery remains unverified until step 5 succeeds.

References: [Resend send API](https://resend.com/docs/api-reference/emails/send-email), [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [domain verification](https://resend.com/docs/dashboard/domains/introduction), [Upstash REST](https://upstash.com/docs/redis/features/restapi), [Vercel request headers](https://vercel.com/docs/headers/request-headers).
