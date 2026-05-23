// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.

//TanStack Start looks at the files in the src/routes directory and creates a route tree based on the file structure. Each file corresponds to a route, and the routeTree.gen.ts file is generated automatically to include all the routes in the app.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.

//starts TanStack Start's dev server from src/server.ts instead of the default entry to include our SSR error wrapper. 
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
