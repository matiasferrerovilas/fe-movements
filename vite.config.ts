import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  define: {
    global: "window",
  },
  build: {
    chunkSizeWarningLimit: 1500,
    target: "es2022",
    minify: "esbuild",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("antd")) return "antd";
            if (id.includes("dayjs")) return "dayjs";
            return "vendor";
          }

          if (id.includes("/balance")) return "balance";
          if (id.includes("/services")) return "services";

          return undefined;
        },
      },
    },
  },
});
