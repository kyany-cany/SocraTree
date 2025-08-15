import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://localhost:4000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "^/users": BACKEND_ORIGIN,
      "^/oauth": BACKEND_ORIGIN,
      "^/api": BACKEND_ORIGIN,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
