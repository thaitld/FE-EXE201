import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "es-toolkit-compat-resolver",
      enforce: "pre",
      resolveId(id) {
        if (id.startsWith("es-toolkit/compat/")) {
          return "\0" + id;
        }
        return null;
      },
      load(id) {
        if (id.startsWith("\0es-toolkit/compat/")) {
          const name = id.replace("\0es-toolkit/compat/", "");
          return `export { ${name} as default } from 'es-toolkit/compat';`;
        }
        return null;
      },
    },
  ],
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Vite 8 uses Rolldown instead of esbuild for dependency pre-bundling.
    // Force-include es-toolkit/compat so Recharts 3.x sub-path imports
    // (e.g. es-toolkit/compat/get) are resolved correctly from the ESM barrel.
    include: ["es-toolkit/compat"],
  },
});
