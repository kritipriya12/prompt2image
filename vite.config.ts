import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import dotenv from 'dotenv';

// Load .env in the vite config process so the dev server proxy can read
// a local HUGGINGFACE_API_KEY (only used on the dev server). This keeps
// secrets out of the client bundle while allowing the dev proxy to attach
// an Authorization header when present.
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy requests starting with /api/hf to the Hugging Face Inference API
    // This avoids CORS errors during local development by routing requests
    // through the dev server. In production you should implement a server
    // side proxy that keeps your API key secret.
    proxy: (() => {
      const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || '';
  const authHeader: { [k: string]: string } | undefined = hfKey ? { Authorization: `Bearer ${hfKey}` } : undefined;

      return {
        '/api/hf': {
          // The old api-inference endpoint is deprecated. The router endpoint
          // should be used instead. We forward /api/hf/... ->
          // https://router.huggingface.co/hf-inference/...
          target: 'https://router.huggingface.co',
          changeOrigin: true,
          secure: true,
          // rewrite so /api/hf/models/... -> /hf-inference/models/...
          rewrite: (path) => path.replace(/^\/api\/hf/, '/hf-inference'),
          // Attach Authorization on the dev server only when the env var is set.
          // This avoids sending the key to the browser while allowing local
          // development to call the upstream service.
          headers: authHeader,
        },
      };
    })(),
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
