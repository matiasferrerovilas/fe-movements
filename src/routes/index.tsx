import { useKeycloak } from "@react-keycloak/web";
import { createFileRoute } from "@tanstack/react-router";
import { Grid, Typography } from "antd";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: isMobile ? 40 : 60,
        paddingBottom: 0,
        gap: isMobile ? 16 : 24,
      }}
    >
      <Title
        level={isMobile ? 2 : 1}
        className="fade-in-up"
        style={{ margin: 0, fontWeight: 700, textAlign: "center", animationDelay: "0ms" }}
      >
        Bienvenido{username ? `, ${username}` : ""} 👋
      </Title>

      <img
        src="/robot.png"
        alt="Robot"
        className="fade-in-up"
        style={{
          width: isMobile ? "70%" : "50vh",
          height: "auto",
          objectFit: "contain",
          userSelect: "none",
          animationDelay: "120ms",
        }}
      />
    </div>
  );
}
