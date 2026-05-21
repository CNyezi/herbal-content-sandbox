# herbal-content-sandbox

Small Git-backed content site for Herbal SEO/content self-maintenance runs.

The repository intentionally includes metadata and frontmatter defects so the
SEO pack can discover candidate improvements before the framework generates PRs.

## Scripts

- `pnpm build` — render a tiny static site into `dist/`
- `pnpm content:check` — validate frontmatter fields used by the first SEO pack
- `pnpm test` — alias for `content:check`
- `pnpm typecheck` — syntax-check local scripts

