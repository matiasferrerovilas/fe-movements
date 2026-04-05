import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosInterceptorProvider } from "./apis/AxiosInterceptorProvider";
import "./App.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ConfigProvider, theme } from "antd";
import { WebSocketProvider } from "./apis/websocket/WebSocketProvider";
import type { RootRouteContext } from "./routes/__root";
import { useContext, useMemo } from "react";
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

function RouterWithAuth() {
  const auth = useContext(AuthContext);
  const { keycloak } = useKeycloak();

  const router = useMemo(
    () =>
      createRouter({
        routeTree,
        context: {
          queryClient,
          auth: {
            ...auth,
            keycloak,
          },
          skipAuth: false,
        },
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return <RouterProvider router={router} />;
}

function ThemedApp() {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          fontFamily: "Inter",
          borderRadius: 10,
        },
      }}
    >
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
