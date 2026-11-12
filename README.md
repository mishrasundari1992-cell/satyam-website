# Satyam Yatra & Travels

Pilgrimage travel enquiry website using Next.js App Router, TypeScript, React, and Tailwind CSS. This release includes the homepage, destination overview dialogs, travel package suggestions, privacy and terms pages, and WhatsApp/call/email links. Full individual destination pages and bilingual content are future work.

## Local development

Use Node.js 22 and npm. Run `npm ci`, then `npm run dev` and open the printed URL. A workspace-local runtime may exist under `.tools` on the original computer; it is excluded from GitHub and deployment.

```sh
npm run lint
npm run check:assets
npm run build
npm run typecheck
npm audit --omit=dev --audit-level=high
```

GitHub Actions repeats these checks on pull requests and pushes to main. TypeScript runs after build so Next.js route types exist on a clean checkout.

## Vercel deployment

1. Review and merge the website pull request into `main` after checks pass.
2. In Vercel, select **Add New → Project**, import `mishrasundari1992-cell/satyam-website`, and use the **Next.js** preset.
3. Use repository root (`./`) as Root Directory and **22.x** as Node.js version. Leave Output Directory at the framework default. `vercel.json` defines installation and build commands; do not select a static HTML preset or `out` directory.
4. Optionally set server environment variable `SITE_URL` to the final public HTTPS domain. Do not use localhost. Without an override the app uses `VERCEL_PROJECT_PRODUCTION_URL`. Redeploy after changing environment variables or a production domain.
5. Deploy, open the returned URL, and check mobile layout, every image, search, destination dialogs, form validation, and phone/WhatsApp/email handoffs. Also check `/privacy-policy`, `/terms-and-conditions`, `/robots.txt`, `/sitemap.xml`, and social previews.
6. Preview builds are noindex. Production with a public origin enables indexing. Confirm canonical links and sitemap contain the correct production domain before requesting indexing.

Official documentation: https://vercel.com/docs/frameworks/full-stack/nextjs

## Contact and enquiry behavior

- WhatsApp / call: +91 9628568807
- Email: satyambasti9554@gmail.com

The form validates required inputs and prepares a WhatsApp message for the visitor to review and send. It does **not** automatically send email, save leads, reserve services, or confirm bookings. Email links launch the user's email app. No credentials, analytics, payment gateway, or server lead database are enabled. No live email delivery has been tested.

Automated email is a later integration: add server validation and sanitization, anti-spam, shared rate limiting, idempotency, proper error states, and provider configuration. Keep secrets in server environment variables, verify the sender domain, and perform a real delivery test before claiming email works.

## Images and publishing precautions

Next.js `Image` provides responsive images with alt text and `sizes`, a priority hero, and containers that reserve layout space. Optimized WebP assets are local and committed. New asset URLs avoid earlier JPG cache issues; no remote image host is needed.

Source credits: `docs/image-sources.md`. The Ayodhya photograph was supplied by the user. Confirm publication rights for every image; credits alone do not grant permission. Images illustrate destinations rather than guarantee a view, season, or service. The Himalayan landscape is not a specific Char Dham shrine.

## Security and scope

`.env*`, `.tools`, `.next`, `node_modules`, `.vercel`, logs, and local artifacts are excluded. `.env.example` contains no secrets. Security headers disable framing and MIME sniffing and restrict sensitive browser features. Do not collect identity documents or payment information through the form.

The owner should review the privacy and travel terms against actual correspondence retention, supplier arrangements, and booking terms before publication. Update those policies and handling before enabling analytics, server email, or a database.

This is deployable as the current contact and enquiry website. All 23 pages, automated email, Hindi routes, and analytics from the longer-term brief are not complete. Browser/device QA and actual communication handoffs still require preview review; a passing build is not a substitute.
