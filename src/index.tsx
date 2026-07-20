import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve static assets from public/ (icons, favicon, robots.txt, ...).
    "/images/*": (req) => {
      const path = new URL(req.url).pathname;
      return new Response(Bun.file(`public${path}`));
    },

    // Weapon type artwork (public/weapons/*.webp).
    "/weapons/*": (req) => {
      const path = new URL(req.url).pathname;
      return new Response(Bun.file(`public${path}`));
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
