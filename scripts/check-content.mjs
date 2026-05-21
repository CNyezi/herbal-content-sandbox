import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const files = listMarkdown(join(root, 'content'));
const problems = [];
const slugs = new Map();

for (const file of files) {
  const rel = relative(root, file);
  const frontmatter = parseFrontmatter(readFileSync(file, 'utf8'));
  required(frontmatter.title, rel, 'title');
  required(frontmatter.description, rel, 'description');
  required(frontmatter.slug, rel, 'slug');
  required(frontmatter.updatedAt, rel, 'updatedAt');
  if (typeof frontmatter.description === 'string' && frontmatter.description.length < 80) {
    problems.push(`${rel}: description should be at least 80 chars`);
  }
  if (typeof frontmatter.slug === 'string') {
    slugs.set(frontmatter.slug, [...(slugs.get(frontmatter.slug) ?? []), rel]);
  }
}

for (const [slug, owners] of slugs.entries()) {
  if (owners.length > 1) problems.push(`duplicate slug "${slug}": ${owners.join(', ')}`);
}

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}

function required(value, rel, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    problems.push(`${rel}: missing ${field}`);
  }
}

function listMarkdown(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...listMarkdown(path));
    else if (entry.endsWith('.md')) out.push(path);
  }
  return out;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---\n')) return {};
  const end = raw.indexOf('\n---', 4);
  if (end === -1) return {};
  const record = {};
  for (const line of raw.slice(4, end).split('\n')) {
    const match = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (!match) continue;
    record[match[1]] = match[2].replace(/^['"]|['"]$/g, '').trim();
  }
  return record;
}
