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
    chunkSizeWarningLimit: 500,
    target: "es2022",
    minify: "esbuild",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // UI - Ant Design (separado para mejor caching)
            if (id.includes("antd")) return "antd";
            if (id.includes("@ant-design/icons")) return "antd-icons";

            // Gráficos - Recharts y dependencias (lazy loaded en home/balance)
            if (
              id.includes("recharts") ||
              id.includes("d3-") ||
              id.includes("victory-vendor")
            ) {
              return "charts";
            }

            // Fechas
            if (id.includes("dayjs")) return "dayjs";

            // React core
            if (id.includes("react-dom")) return "react-dom";
            if (id.includes("/react/") || id.includes("/react@")) return "react";

            // TanStack (routing y data fetching)
            if (id.includes("@tanstack")) return "tanstack";

            // Auth
            if (id.includes("keycloak")) return "keycloak";

            // WebSocket
            if (id.includes("stomp") || id.includes("sockjs")) return "websocket";

            // El resto de dependencias menores
            return "vendor";
          }

          // Code splitting por rutas (ya manejado por TanStack Router)
          return undefined;
        },
      },
    },
  },
});
