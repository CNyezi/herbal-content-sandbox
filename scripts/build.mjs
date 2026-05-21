import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const contentRoot = join(root, 'content');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const file of listMarkdown(contentRoot)) {
  const raw = readFileSync(file, 'utf8');
  const title = /^title:\s*(.+)$/m.exec(raw)?.[1]?.trim() ?? basename(file, '.md');
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
</head>
<body>
${markdownBody(raw)}
</body>
</html>
`;
  const outName = basename(file, '.md') + '.html';
  writeFileSync(join(dist, outName), html);
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

function markdownBody(raw) {
  const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
  return body.split('\n').map(line => {
    if (line.startsWith('# ')) return `<h1>${escapeHtml(line.slice(2))}</h1>`;
    if (line.trim() === '') return '';
    return `<p>${escapeHtml(line)}</p>`;
  }).join('\n');
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
