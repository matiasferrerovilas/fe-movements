import { useKeycloak } from "@react-keycloak/web";
import { createFileRoute } from "@tanstack/react-router";
import { Grid, Typography } from "antd";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";
import MonthlySummary from "../components/home/MonthlySummary";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export const Route = createFileRoute("/")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { keycloak } = useKeycloak();
  const username = keycloak.tokenParsed?.preferred_username;

  return (
    <div
      style={{
        width: "100%",
        paddingTop: isMobile ? 24 : 32,
        paddingBottom: 32,
      }}
    >
      <Title
        level={isMobile ? 3 : 2}
        className="fade-in-up"
        style={{
          margin: 0,
          fontWeight: 700,
          marginBottom: isMobile ? 20 : 28,
          animationDelay: "0ms",
        }}
      >
        Bienvenido{username ? `, ${username}` : ""}
      </Title>

      <MonthlySummary />
    </div>
  );
}
