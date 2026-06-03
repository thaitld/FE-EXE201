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
    // Vite 8 still uses esbuild for dev dependency pre-bundling.
    // Force-include es-toolkit/compat and use the esbuild plugin to rewrite sub-path imports.
    include: ["es-toolkit/compat"],
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
