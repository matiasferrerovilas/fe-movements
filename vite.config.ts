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
    sourcemap: false,
    rollupOptions: {
      output: {
        // No separar react/react-dom/scheduler en su propio chunk: cualquier paquete de
        // node_modules que no calce en los buckets de abajo (p.ej. use-sync-external-store,
        // o dependencias internas de rc-component que antd arrastra) cae en "vendor" — y como
        // esos paquetes sí importan react directamente, un chunk "react" separado termina siendo
        // importado *por* vendor y a la vez importando *desde* vendor (algún módulo agrupado ahí
        // por matching de substring que a su vez depende de algo de vendor). Ese ciclo entre
        // chunks de Rollup no respeta el orden de inicialización de módulos ES: el chunk que
        // queda "del lado de atrás" del ciclo corre su código de nivel superior antes de que el
        // otro termine de inicializarse, lo que tiraba "Cannot set properties of undefined
        // (setting 'Activity')" en producción (use-sync-external-store llamando a la factory de
        // React antes de que el chunk de React hubiera terminado de crear su objeto de exports).
        // Fusionar react en el bucket "vendor" (mismo chunk, sin límite entre ambos) elimina la
        // posibilidad del ciclo sin tener que auditar cada dependencia transitiva.
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

            // TanStack (routing y data fetching)
            if (id.includes("@tanstack")) return "tanstack";

            // Auth
            if (id.includes("keycloak")) return "keycloak";

            // WebSocket
            if (id.includes("stomp") || id.includes("sockjs")) return "websocket";

            // React (+ react-dom, scheduler, use-sync-external-store, y todo lo demás que no
            // calzó arriba) — ver comentario de arriba sobre por qué esto va todo junto.
            return "vendor";
          }

          // Code splitting por rutas (ya manejado por TanStack Router)
          return undefined;
        },
      },
    },
  },
});
