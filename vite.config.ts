import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { wayfinder } from "@laravel/vite-plugin-wayfinder";

export default defineConfig({
  plugins: [
    laravel({
      input: ["resources/css/app.css", "resources/js/app.tsx"],
      ssr: "resources/js/ssr.tsx",
      refresh: true,
    }),
    react(),
    tailwindcss(),
    wayfinder({
      formVariants: true,
    }),
  ],
  server: {
    https: false,
    host: "localhost",
    hmr: {
      host: "localhost",
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@actions/": "./resources/js/actions",
      "@routes/": "./resources/js/routes",
    },
  },
});
