import { readFileSync, existsSync } from 'node:fs';
const files = ['src/lib/tours.ts', 'src/components/home.tsx', 'src/app/layout.tsx'];
const references = new Set(files.flatMap(file => [...readFileSync(file, 'utf8').matchAll(/\/images\/[a-z0-9-]+\.webp/g)].map(match => match[0])));
if (references.size < 8) throw new Error('Expected destination imagery was not found.');
for (const reference of references) {
 const file = `public${reference}`;
 if (!existsSync(file)) throw new Error(`Missing image: ${file}`);
 const bytes = readFileSync(file);
 if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw new Error(`Invalid WebP image: ${file}`);
}
console.log(`Verified ${references.size} local WebP image references.`);
