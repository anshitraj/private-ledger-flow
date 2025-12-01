import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy Zama relayer requests to avoid CORS issues in development
    // Correct relayer URL: https://relayer.testnet.zama.org/
    proxy: {
      '/zama-relayer': {
        target: 'https://relayer.testnet.zama.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zama-relayer/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Zama relayer proxy error', err);
          });
        },
      },
    },
    // Add CORS headers for development
    cors: true,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
