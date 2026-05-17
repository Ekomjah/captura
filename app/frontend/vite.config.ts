import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // String shorthand: http://localhost:5173/api -> http://localhost:5000/api
      "/v1": {
        target: "http://localhost:8000", // Your backend URL
        changeOrigin: true,
        secure: false, // If using self-signed certificates
      },
    },
  },
});
