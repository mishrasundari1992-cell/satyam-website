const configuredUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
function getSiteUrl() {
 const value = configuredUrl || (vercelHost ? `https://${vercelHost}` : 'http://localhost:3000');
 const url = new URL(value);
 if (!['http:', 'https:'].includes(url.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL');
 return url.origin;
}
export const siteUrl = getSiteUrl();
export const indexable = !siteUrl.includes('localhost') && !siteUrl.includes('127.0.0.1') &&
 (process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : process.env.NODE_ENV === 'production');
