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
        target: "https://www.meedivo.me/api",
        // secure: false,
        // changeOrigin: true,
      },
    },
  },
});
