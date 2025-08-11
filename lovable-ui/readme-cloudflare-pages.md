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
- Output directory: `.vercel/output`
- Functions directory: `.vercel/output/functions`
- Static assets: `.vercel/output/static`

## Environment variables
- Optional on Pages. Note: API routes are disabled on Pages in this repo.

## Notes
- `/api/generate` and `/api/generate-daytona` are disabled on Cloudflare Pages and return 501 to satisfy Edge runtime requirements.
- If you need these endpoints, deploy them to a Node environment (e.g., Vercel/Render/Fly) or to Cloudflare Workers/Queues/Durable Objects, and call them from the client.