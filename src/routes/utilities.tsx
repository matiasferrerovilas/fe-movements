import { createFileRoute } from "@tanstack/react-router";
import { Col, Row } from "antd";
import { protectedRouteGuard } from "@/apis/auth/protectedRouteGuard";
import { RoleEnum } from "@/enums/RoleEnum";
import { RecoveryTimeCalculator } from "@/components/utilities/RecoveryTimeCalculator";

export const Route = createFileRoute("/utilities")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Row justify="center" style={{ paddingTop: 30 }}>
      <Col xs={24} md={20} lg={16} className="fade-in-up" style={{ animationDelay: "0ms" }}>
        <RecoveryTimeCalculator />
      </Col>
    </Row>
  );
}
