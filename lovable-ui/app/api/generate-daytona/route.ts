import type { NextRequest } from "next/server";

export const runtime = 'edge';

export async function POST(_req: NextRequest) {
  return new Response(
    JSON.stringify({
      error: "This endpoint is disabled on Cloudflare Pages (Edge runtime). Use a Node host or local dev to run Daytona generation.",
    }),
    { status: 501, headers: { "Content-Type": "application/json" } }
  );
}