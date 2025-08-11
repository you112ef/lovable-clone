import type { NextRequest } from "next/server";

export const runtime = 'edge';

export async function POST(_req: NextRequest) {
  return new Response(
    JSON.stringify({
      error: "This endpoint is disabled on Cloudflare Pages (Edge runtime). Move this logic to a Node/Workers Durable Object or call external API directly from the client.",
    }),
    { status: 501, headers: { "Content-Type": "application/json" } }
  );
}