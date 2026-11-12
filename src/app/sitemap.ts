import type { MetadataRoute } from 'next';
import { siteUrl, indexable } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap {
 return indexable ? ['', '/privacy-policy', '/terms-and-conditions'].map(path => ({ url: `${siteUrl}${path}` })) : [];
}
