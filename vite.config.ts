import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Always use production backend since it's deployed on Render
  const backendUrl = "https://auth-back-ula7.onrender.com";

  return {
    server: {
      host: "::",
      port: 8080,
      // Removed proxy configuration to make direct API calls to production backend
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
