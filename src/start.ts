import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

// return the page or error
const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error; //HTTP error
    }
    console.error(error); //internal server error
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Server-side metadata endpoint middleware. Handles POST /api/meta
const metaMiddleware = createMiddleware().server(async ({ request, next }) => {
  try {
    const url = new URL(request.url);
    if (url.pathname === "/api/meta" && request.method === "POST") {
      const body = await request.json();
      const urls: string[] = Array.isArray(body?.urls) ? body.urls : [];
      const limited = urls.slice(0, 20);

      const fetchMeta = async (target: string) => {
        try {
          const res = await fetch(target, { redirect: "follow" });
          const text = await res.text();
          // crude sanitization: remove scripts/styles and tags to get visible text
          const bodyOnly = text
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<!--([\s\S]*?)-->/g, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/[\s\u00A0]+/g, " ")
            .trim();
          const titleMatch = text.match(/<title>([^<]*)<\/title>/i);
          const descMatch =
            text.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
            text.match(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
          const kwMatch = text.match(/<meta[^>]+name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i);
          const meta = {
            title: titleMatch ? titleMatch[1].trim() : undefined,
            description: descMatch ? descMatch[1].trim() : undefined,
            keywords: kwMatch ? kwMatch[1].split(/[,\s]+/).map((s) => s.trim()).filter(Boolean) : undefined,
            fullText: bodyOnly,
          };
          return { url: target, meta };
        } catch (e) {
          return { url: target, meta: {} };
        }
      };

      const results = await Promise.all(limited.map((u) => fetchMeta(u)));
      return new Response(JSON.stringify({ results }), {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  } catch (e) {
    console.error("meta middleware error", e);
  }
  return await next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [metaMiddleware, errorMiddleware], // meta middleware first
}));
