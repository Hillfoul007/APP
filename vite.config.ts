import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const backendUrl = "https://auth-back-ula7.onrender.com"; // Production backend

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: ["chore-app-ik6k.onrender.com"], // 🛡️ Allow your deployed frontend host
    },
    define: {
      __BACKEND_URL__: JSON.stringify(backendUrl), // Optional: use in frontend code
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const backendUrl = "https://auth-back-ula7.onrender.com"; // Production backend

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: ["chore-app-ik6k.onrender.com"], // 🛡️ Allow your deployed frontend host
    },
    define: {
      __BACKEND_URL__: JSON.stringify(backendUrl), // Optional: use in frontend code
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
