# Deployment review — 12 November 2026

## Passed locally

- ESLint: no errors or warnings.
- Asset validation: all 9 referenced local WebP files exist and have valid WebP headers.
- Production build: homepage, privacy policy, terms, icon, robots and sitemap compiled.
- TypeScript: no errors.
- Production dependency audit: zero reported vulnerabilities.
- Production-mode Chrome at widths 390, 768 and 1440 px: all displayed destination/package photos decoded; no horizontal overflow; one H1; search filtering; destination dialogs and Escape dismissal; required form fields; phone and email targets; no browser runtime errors.
- Mobile menu opens and closes after navigation.
- Homepage, policy pages, robots, sitemap and Ayodhya image return HTTP 200.
- Security headers verified: X-Content-Type-Options and X-Frame-Options.

Original Ayodhya upload was about 2.9 MB. The optimized Ayodhya WebP is about 178 KB. The 9 deployable photos total about 1.37 MB; originals, the obsolete Ayodhya photo, local tools, build output and dependencies are excluded from the GitHub upload.

## Remaining limitations

- Eight moderate dependency audit entries affect the development linting dependency chain (typescript-eslint/minimatch). Production dependencies have no reported advisories. A forced downgrade of Next.js lint configuration was deliberately avoided; reassess compatible upstream updates before future maintenance releases.
- Actual WhatsApp message sending, phone calls, and external email-app behavior require the owner's device review. No automatic email service is configured or claimed.
- Final Vercel URL, HTTPS, production canonical tags and indexing must be verified after deployment; localhost is intentionally noindex.
- Image sources are recorded in image-sources.md; confirm publication rights and review imagery against business preferences.
- Full destination routes, Hindi pages and automated lead processing are future work. This PR delivers the current contact/enquiry website, not the entire original phased brief.

Screenshots are stored locally in `.artifacts/home-390.png`, `home-768.png`, and `home-1440.png`; they are excluded from GitHub. The local browser check helper is under `.tools` and is not a production dependency. GitHub Actions repeats source, asset, build, type and production-audit checks.

