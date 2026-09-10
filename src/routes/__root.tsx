import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Layout, Grid } from "antd"; // 👈 Importar Grid
import { Content, Footer } from "antd/es/layout/layout";
import NavHeader from "@/components/NavHeader";
import type { QueryClient } from "@tanstack/react-query";
import { memo } from "react";
import { QueryLoadingBoundary } from "@/components/QueryLoadingBoundary";
import NotFound from "@/components/NotFound";
import type { AuthContextState } from "@/apis/auth/AuthContext";
import { ColorEnum } from "@/enums/ColorEnum";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import MonthCloseFlow from "@/components/monthclose/MonthCloseFlow";
import type Keycloak from "keycloak-js";
const { useBreakpoint } = Grid;
import module from "../../package.json";

export interface RootRouteContext {
  queryClient: QueryClient;
  auth: AuthContextState & {
    firstLogin: boolean;
    keycloak: Keycloak;
  };
  skipAuth: boolean;
}
const MemoizedNavHeader = memo(NavHeader);

const ContentWrapper: React.FC = () => {
  const screens = useBreakpoint();

  const paddingHorizontal = screens.lg ? 100 : screens.md ? 40 : 16;

  return (
    <div
      style={{
        paddingInline: paddingHorizontal,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <Outlet />
    </div>
  );
};

function RootComponent() {
  const { auth } = Route.useRouteContext();
  const { data: currentUser } = useCurrentUser();
  const showChrome = !auth.firstLogin;

  // Compuerta a pantalla completa: mientras haya un cierre de mes pendiente (metadata.
  // pendingMonthlySummary, que api-movements computa en /users/me), no importa en qué ruta
  // esté el usuario — se muestra el flujo de cierre en lugar de cualquier otra cosa. Después
  // del onboarding (firstLogin) para no pisar ese flujo.
  const pendingMonthClose = !auth.firstLogin
    ? currentUser?.metadata?.pendingMonthlySummary ?? null
    : null;

  if (pendingMonthClose) {
    return <MonthCloseFlow year={pendingMonthClose.year} month={pendingMonthClose.month} />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {showChrome && <MemoizedNavHeader />}
      <Layout>
        <Content>
          <QueryLoadingBoundary>
            <ContentWrapper />
          </QueryLoadingBoundary>
        </Content>
        {showChrome && (
          <Footer
            style={{
              textAlign: "center",
              backgroundColor: ColorEnum.FONDO_GENERAL,
              marginTop: 32,
            }}
          >
            M-1 ©{new Date().getFullYear()} Created by Mati FV v{module.version}
          </Footer>
        )}
      </Layout>
    </Layout>
  );
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
});
