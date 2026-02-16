import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosInterceptorProvider } from "./apis/AxiosInterceptorProvider";
import "./App.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ConfigProvider } from "antd";
import { WebSocketProvider } from "./apis/websocket/WebSocketProvider";
import type { RootRouteContext } from "./routes/__root";
import { useContext } from "react";
import { AuthContext } from "./apis/auth/AuthContext";
import { useKeycloak } from "@react-keycloak/web";
import esES from "antd/locale/es_ES";

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

  const router = createRouter({
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
  });

  return <RouterProvider router={router} />;
}
function App() {
  return (
    <ConfigProvider
      locale={esES}
      theme={{
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

export default App;
