# Deploy to Cloudflare Pages (Next.js)

## Prerequisites
- Cloudflare account with Pages enabled
- Repo hosted on GitHub/GitLab

## Install deps locally (optional)

```bash
cd lovable-ui
npm install
```

## Build command (Pages settings)
- Build command: `npm run cf:build`
- Output directory: `.vercel/output/static`
- Functions directory: `.vercel/output/functions`
- Build output: `.vercel/output`

These paths are produced by `@cloudflare/next-on-pages`.

## Environment variables
Add as needed in Pages > Settings > Environment variables:
- `ANTHROPIC_API_KEY`
- `DAYTONA_API_KEY` (optional; the `/api/generate-daytona` endpoint is disabled on Edge and requires a Node host)

## Notes
- `/api/generate` runs on Edge and works on Pages.
- `/api/generate-daytona` returns 501 on Pages (Edge), as it relies on Node child_process. Run locally or deploy to a Node host if required.