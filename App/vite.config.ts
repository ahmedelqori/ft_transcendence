import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    port: 5500,
    proxy: {
      "/api": {
        target: "https://64.23.191.17/api",
        // secure: false,
        // changeOrigin: true,
      },
    },
  },
});
