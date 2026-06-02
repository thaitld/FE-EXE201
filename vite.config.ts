import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
    // esbuild plugin that runs DURING pre-bundling (unlike Vite plugins which don't).
    // Recharts 3.x does `import get from 'es-toolkit/compat/get'` which resolves to
    // CJS shim files that use broken internal require() chains.
    // This plugin intercepts those deep sub-path imports and rewrites them to
    // re-export from the proper ESM barrel file (es-toolkit/compat).
    esbuildOptions: {
      plugins: [
        {
          name: "es-toolkit-compat-esm-fix",
          setup(build) {
            build.onResolve(
              { filter: /^es-toolkit\/compat\/\w+$/ },
              (args) => ({
                path: args.path,
                namespace: "es-toolkit-compat-virtual",
              }),
            );
            build.onLoad(
              { filter: /.*/, namespace: "es-toolkit-compat-virtual" },
              (args) => {
                const name = args.path.split("/").pop();
                return {
                  contents: `export { ${name} as default, ${name} } from "es-toolkit/compat";`,
                  resolveDir: path.resolve(__dirname),
                  loader: "js",
                };
              },
            );
          },
        },
      ],
    },
  },
});
