import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  const backendUrl = isProduction
    ? "https://auth-back-ula7.onrender.com"
    : "http://localhost:3001";

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: isProduction,
        },
        "/health": {
          target: backendUrl,
          changeOrigin: true,
          secure: isProduction,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
