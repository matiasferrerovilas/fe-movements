import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosInterceptorProvider } from "./apis/AxiosInterceptorProvider";
import "./App.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ConfigProvider, theme } from "antd";
import { WebSocketProvider } from "./apis/websocket/WebSocketProvider";
import type { RootRouteContext } from "./routes/__root";
import { useContext, useEffect, useMemo } from "react";
import { AuthContext } from "./apis/auth/AuthContext";
import { useKeycloak } from "@react-keycloak/web";
import esES from "antd/locale/es_ES";
import { ThemeProvider } from "./apis/theme/ThemeProvider";
import { useTheme } from "./apis/theme/ThemeContext";

declare module "@tanstack/react-router" {
  interface Register {
    context: RootRouteContext;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// El router se crea una sola vez como singleton fuera de cualquier componente.
// El contexto se actualiza via router.update() + router.invalidate() cuando
// el estado de auth cambia, evitando que los guards queden con el contexto frozen.
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: {
      authenticated: false,
      firstLogin: false,
      loading: true,
      completeOnboarding: () => {},
      keycloak: undefined as never,
    },
    skipAuth: false,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

function RouterWithAuth() {
  const auth = useContext(AuthContext);
  const { keycloak } = useKeycloak();

  // Cada vez que el estado de auth cambia (loading, firstLogin, authenticated)
  // actualizamos el contexto del router y lo invalidamos para que los beforeLoad
  // guards se re-ejecuten con los valores correctos.
  useEffect(() => {
    router.update({
      context: {
        queryClient,
        auth: { ...auth, keycloak },
        skipAuth: false,
      },
    });
    if (!auth.loading) {
      router.invalidate();
    }
  }, [auth.loading, auth.firstLogin, auth.authenticated, auth, keycloak]);

  return <RouterProvider router={router} />;
}

function ThemedApp() {
  const { isDark } = useTheme();

  const themeConfig = useMemo(
    () => ({
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        fontFamily: "Inter",
        borderRadius: 10,
      },
    }),
    [isDark],
  );

  return (
    <ConfigProvider locale={esES} theme={themeConfig}>
      <AxiosInterceptorProvider>
        <QueryClientProvider client={queryClient}>
          <WebSocketProvider>
            <RouterWithAuth />
          </WebSocketProvider>
        </QueryClientProvider>
      </AxiosInterceptorProvider>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
