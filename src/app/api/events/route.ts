import { subscribe } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("data: {\"type\":\"connected\"}\n\n"));
      const unsubscribe = subscribe((event, data) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: event, data })}\n\n`));
        } catch { unsubscribe(); }
      });
      const heartbeat = setInterval(() => {
        try { controller.enqueue(encoder.encode(`data: {\"type\":\"heartbeat\"}\n\n`)); }
        catch { clearInterval(heartbeat); unsubscribe(); }
      }, 30000);
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
