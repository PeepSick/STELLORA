import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const isLib = mode === "lib";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    assetsInclude: ["**/*.glsl", "**/*.vert", "**/*.frag"],
    ...(isLib
      ? {
          build: {
            lib: {
              entry: path.resolve(__dirname, "src/index.ts"),
              name: "Stellaris",
              fileName: "stellaris",
              formats: ["es"],
            },
            rollupOptions: {
              external: ["react", "react-dom", "react/jsx-runtime", "three"],
              output: {
                globals: {
                  react: "React",
                  "react-dom": "ReactDOM",
                  three: "THREE",
                },
              },
            },
          },
        }
      : {}),
  };
});
