import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 8080,
    open: true,
  },
  build: {
    target: "ES2022",
    outDir: "dist",
  },
});
