#!/usr/bin/env node
// Usage: node scripts/new-game.mjs <slug> "<Title>" ["Description"] [--tags=a,b]
import { cpSync, existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const tagArg = args.find(a => a.startsWith('--tags='));
const [slug, title, description = ''] = args.filter(a => !a.startsWith('--'));

if (!slug || !title) {
  console.error('Usage: node scripts/new-game.mjs <slug> "<Title>" ["Description"] [--tags=a,b]');
  process.exit(1);
}
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('Slug must be lowercase letters, numbers and dashes, e.g. space-dodger');
  process.exit(1);
}

const dest = join(root, 'games', slug);
if (existsSync(dest)) {
  console.error(`games/${slug} already exists`);
  process.exit(1);
}

cpSync(join(root, 'templates', 'vanilla-js'), dest, { recursive: true });
for (const file of readdirSync(dest)) {
  const p = join(dest, file);
  const text = readFileSync(p, 'utf8')
    .replaceAll('__TITLE__', title)
    .replaceAll('__DESCRIPTION__', description);
  writeFileSync(p, text);
}

const registryPath = join(root, 'games.json');
const games = JSON.parse(readFileSync(registryPath, 'utf8'));
games.push({
  slug,
  title,
  description,
  tags: tagArg ? tagArg.slice(7).split(',').map(t => t.trim()).filter(Boolean) : [],
  added: new Date().toISOString().slice(0, 10),
});
writeFileSync(registryPath, JSON.stringify(games, null, 2) + '\n');

console.log(`Created games/${slug} and added it to games.json`);
