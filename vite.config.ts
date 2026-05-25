import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
// export default defineConfig({
//   plugins: [react(), tailwindcss(), tsconfigPaths()],
// });
export default defineConfig({
  base: "/my-linktree/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});