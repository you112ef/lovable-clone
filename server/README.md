# Lovable API Server

Simple Express server exposing `/api/generate-daytona` with SSE.

## Run locally

```bash
cd server
npm install
DAYTONA_API_KEY=... ANTHROPIC_API_KEY=... npm run dev
```

## Deploy (Render example)
- Create a new Web Service from this `server/` directory
- Build command: `npm install`
- Start command: `npm start`
- Environment: `DAYTONA_API_KEY`, `ANTHROPIC_API_KEY`

Point `NEXT_PUBLIC_GENERATE_API_URL` on Cloudflare Pages to:
`https://your-service.onrender.com/api/generate-daytona`