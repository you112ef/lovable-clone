# Lovable Clone

Thank you so much for checking out this project! 🙏  
We appreciate your interest and hope you enjoy exploring and building with it.

## Getting Started

Before you begin, please make sure to replace the API keys in your `.env` file:

- Get your Anthropic API key from: [Anthropic Console](https://console.anthropic.com/dashboard)
- Get your Daytona API key from: [Daytona Dashboard](https://www.daytona.io/)

Add these keys to your `.env` file as follows:

``` .env
ANTHROPIC_API_KEY=your_anthropic_api_key
DAYTONA_API_KEY=your_daytona_api_key
```

## Frontend (Cloudflare Pages)
- Build command: `npm run cf:build`
- Output directory: `.vercel/output/static`
- Functions directory: `.vercel/output/functions`

## Backend (Docker, no Fly)
- Path: `server/`
- Dockerfile: `server/Dockerfile`
- Build: `docker build -t lovable-api ./server`
- Run: `docker run -p 8080:8080 -e ANTHROPIC_API_KEY -e DAYTONA_API_KEY lovable-api`
- Endpoint: `http://localhost:8080/api/generate-daytona`

To connect the frontend automatically, set `NEXT_PUBLIC_GENERATE_API_URL` in Cloudflare Pages to the public URL of your Docker-hosted API.

