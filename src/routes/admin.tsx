import { createFileRoute } from "@tanstack/react-router";
import { Col, Flex, Grid, Row, Tabs, Typography, theme } from "antd";
import ToolOutlined from "@ant-design/icons/ToolOutlined";
import SafetyOutlined from "@ant-design/icons/SafetyOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";
import AdminUserType from "../components/admin/AdminUserType";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

export const Route = createFileRoute("/admin")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN],
  }),
  component: RouteComponent,
});

// ── Mantenimiento ─────────────────────────────────────────────────────────────

function MantenimientoPanel() {
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={12}
      style={{ paddingTop: 48, paddingBottom: 48 }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: token.borderRadiusLG,
          background: token.colorFillSecondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ToolOutlined style={{ fontSize: 26, color: token.colorTextTertiary }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
          Sin acciones configuradas
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Agregá acciones de mantenimiento acá.
        </Text>
      </div>
    </Flex>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const ADMIN_TABS = [
  {
    key: "perfil",
    label: "Mi Perfil",
    icon: <UserOutlined />,
    children: <AdminUserType />,
  },
  {
    key: "mantenimiento",
    label: "Mantenimiento",
    icon: <ToolOutlined />,
    children: <MantenimientoPanel />,
  },
];

// ── RouteComponent ────────────────────────────────────────────────────────────

function RouteComponent() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { token } = theme.useToken();

  return (
    <Row justify="center" style={{ paddingTop: 30 }}>
      <Col
        xs={24}
        md={20}
        lg={16}
        className="fade-in-up"
        style={{ animationDelay: "0ms" }}
      >
        {/* Header */}
        <Flex align="center" gap={10} style={{ marginBottom: 24 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: token.borderRadius,
              background: token.colorWarningBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <SafetyOutlined style={{ fontSize: 18, color: token.colorWarning }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 700, lineHeight: 1.2 }}>
              Panel de administración
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Solo visible para administradores
            </Text>
          </div>
        </Flex>

        <Tabs
          defaultActiveKey="perfil"
          size="middle"
          tabPlacement={isMobile ? "top" : "start"}
          items={ADMIN_TABS.map(({ key, label, icon, children }) => ({
            key,
            label: (
              <span>
                {icon} {label}
              </span>
            ),
            children: (
              <div style={{ paddingTop: isMobile ? 12 : 0 }}>{children}</div>
            ),
          }))}
        />
      </Col>
    </Row>
  );
}
