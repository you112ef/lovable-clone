import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Detect Edge runtime (Cloudflare Pages / Edge)
  const isEdgeRuntime = typeof (globalThis as any).EdgeRuntime !== 'undefined';

  if (isEdgeRuntime) {
    return new Response(
      JSON.stringify({
        error: "This endpoint is not supported on Cloudflare Pages (Edge runtime). Use local dev or a Node-compatible host for Daytona generation.",
      }),
      { status: 501, headers: { "Content-Type": "application/json" } }
    );
  }

  // Dynamically import Node-only modules to avoid bundling on Edge
  const { spawn } = await import("child_process");
  const path = await import("path");

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.DAYTONA_API_KEY || !process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing API keys" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    (async () => {
      try {
        const scriptPath = path.join(process.cwd(), "scripts", "generate-in-daytona.ts");
        const child = spawn("npx", ["tsx", scriptPath, prompt], {
          env: {
            ...process.env,
            DAYTONA_API_KEY: process.env.DAYTONA_API_KEY,
            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
          },
        });

        let sandboxId = "";
        let previewUrl = "";
        let buffer = "";

        child.stdout.on("data", async (data) => {
          buffer += data.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            if (line.includes('__CLAUDE_MESSAGE__')) {
              const jsonStart = line.indexOf('__CLAUDE_MESSAGE__') + '__CLAUDE_MESSAGE__'.length;
              try {
                const message = JSON.parse(line.substring(jsonStart).trim());
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ type: "claude_message", content: message.content })}\n\n`)
                );
              } catch {}
            } else if (line.includes('__TOOL_USE__')) {
              const jsonStart = line.indexOf('__TOOL_USE__') + '__TOOL_USE__'.length;
              try {
                const toolUse = JSON.parse(line.substring(jsonStart).trim());
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ type: "tool_use", name: toolUse.name, input: toolUse.input })}\n\n`)
                );
              } catch {}
            } else if (line.includes('__TOOL_RESULT__')) {
              continue;
            } else {
              const output = line.trim();
              if (output && !output.includes('[Claude]:') && !output.includes('[Tool]:') && !output.includes('__')) {
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ type: "progress", message: output })}\n\n`)
                );

                const sandboxMatch = output.match(/Sandbox created: ([a-f0-9-]+)/);
                if (sandboxMatch) sandboxId = sandboxMatch[1];

                const previewMatch = output.match(/Preview URL: (https:\/\/[^\s]+)/);
                if (previewMatch) previewUrl = previewMatch[1];
              }
            }
          }
        });

        child.stderr.on("data", async (data) => {
          const error = data.toString();
          if (error.includes("Error") || error.includes("Failed")) {
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ type: "error", message: error.trim() })}\n\n`)
            );
          }
        });

        await new Promise((resolve, reject) => {
          child.on("exit", (code) => {
            if (code === 0) resolve(code);
            else reject(new Error(`Process exited with code ${code}`));
          });
          child.on("error", reject);
        });

        if (previewUrl) {
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ type: "complete", sandboxId, previewUrl })}\n\n`)
          );
        } else {
          throw new Error("Failed to get preview URL");
        }

        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (error: any) {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`)
        );
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Explicitly mark this route as Node runtime to avoid accidental Edge bundling
export const runtime = 'nodejs';