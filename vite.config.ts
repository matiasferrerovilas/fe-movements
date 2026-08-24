import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const localConfigPath = fileURLToPath(
  new URL("./config/config.local.js", import.meta.url),
);
const prodConfigPath = fileURLToPath(
  new URL("./config/config.prod.js", import.meta.url),
);

// Serves config/config.local.js as /config.js in dev (or config.prod.js when
// run with `--mode prod`), and bakes config/config.prod.js into /config.js
// on every `vite build`.
function envConfig(): Plugin {
  let devConfigPath = localConfigPath;
  return {
    name: "env-config",
    configResolved(config) {
      devConfigPath = config.mode === "prod" ? prodConfigPath : localConfigPath;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/config.js") {
          res.setHeader("Content-Type", "text/javascript");
          res.end(readFileSync(devConfigPath));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "config.js",
        source: readFileSync(prodConfigPath, "utf-8"),
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    envConfig(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    global: "window",
  },
  build: {
    chunkSizeWarningLimit: 500,
    target: "es2022",
    minify: "esbuild",
    cssCodeSplit: true,
    // Temporalmente activado para diagnosticar el crash "Cannot set properties of undefined
    // (setting 'Activity')" en producción — la búsqueda en el bundle minificado no encontró el
    // string "Activity" en ningún lado (la clave se arma dinámicamente en runtime), así que sin
    // stack real no hay forma de identificar qué librería la dispara. Volver a `false` una vez
    // resuelto.
    sourcemap: true,
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

            // React core — react-dom must stay in the SAME chunk as react. Splitting them into
            // separate async chunks doesn't guarantee react's module finishes initializing
            // before react-dom's top-level code runs against it, which threw
            // "Cannot set properties of undefined (setting 'Activity')" in production (react-dom
            // trying to write onto React's shared internals before that module was ready).
            if (
              id.includes("react-dom") ||
              id.includes("/react/") ||
              id.includes("/react@") ||
              id.includes("scheduler")
            ) {
              return "react";
            }

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
