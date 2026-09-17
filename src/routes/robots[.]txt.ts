import { createFileRoute } from "@tanstack/react-router";
import { publicRobotsBody } from "@/lib/cms/robots";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        return new Response(publicRobotsBody(origin), {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
