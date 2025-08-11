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

## API Endpoints on Pages
- `/api/generate` and `/api/generate-daytona` return 501 on Cloudflare Pages.
- To use Daytona generation from Pages, set an external API URL:
  - Add `NEXT_PUBLIC_GENERATE_API_URL` in Pages → Settings → Environment variables
  - Value example: `https://your-node-host.example.com/api/generate-daytona`

## Environment variables
- `NEXT_PUBLIC_GENERATE_API_URL` (optional): external API for generation.

## Notes
- For full server features, deploy APIs on Node/Workers and call from the client.