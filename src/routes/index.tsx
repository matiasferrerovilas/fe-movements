import { createFileRoute } from "@tanstack/react-router";
import { Grid, Typography } from "antd";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { useCurrentUser } from "../apis/hooks/useCurrentUser";
import { RoleEnum } from "../enums/RoleEnum";
import MonthlySummary from "../components/home/MonthlySummary";
import { getUserDisplayName } from "../components/utils/userDisplayName";

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
  const { data: currentUser } = useCurrentUser();
  const displayName = currentUser ? getUserDisplayName(currentUser) : null;

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
        Bienvenido{displayName ? `, ${displayName}` : ""}
      </Title>

      <MonthlySummary />
    </div>
  );
}
