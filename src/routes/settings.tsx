import { createFileRoute } from "@tanstack/react-router";
import { SettingIngreso } from "../components/settings/SettingIngreso";
import { Col, Flex, Grid, Row, Tabs } from "antd";
import { SettingWorkspaces } from "../components/settings/SettingWorkspaces";
import { SettingInviteWorkspaces } from "../components/settings/SettingInviteWorkspaces";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";
import SettingAccount from "../components/settings/SettingAccount";
import { SettingBank } from "../components/settings/SettingBank";
import { SettingCurrency } from "../components/settings/SettingCurrency";
import { UserOutlined, TeamOutlined, WalletOutlined, TagOutlined, BellOutlined } from "@ant-design/icons";
import { SettingCategory } from "../components/settings/SettingCategory";
import { SettingPreferences } from "../components/settings/SettingPreferences";

const { useBreakpoint } = Grid;

export const Route = createFileRoute("/settings")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});

const TABS = [
  {
    key: "cuenta",
    label: "Cuenta",
    icon: <UserOutlined />,
    children: <SettingAccount />,
  },
  {
    key: "workspaces",
    label: "Workspaces",
    icon: <TeamOutlined />,
    children: (
      <Flex vertical gap={16}>
        <SettingInviteWorkspaces />
        <SettingWorkspaces />
      </Flex>
    ),
  },
  {
    key: "finanzas",
    label: "Mis finanzas",
    icon: <WalletOutlined />,
    children: (
      <Flex vertical gap={16}>
        <SettingBank />
        <SettingCurrency />
        <SettingIngreso />
      </Flex>
    ),
  },
  {
    key: "categorias",
    label: "Categorías",
    icon: <TagOutlined />,
    children: <SettingCategory />,
  },
  {
    key: "preferencias",
    label: "Preferencias",
    icon: <BellOutlined />,
    children: <SettingPreferences />,
  },
];

function RouteComponent() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Row justify="center" style={{ paddingTop: 30 }}>
      <Col xs={24} md={20} lg={16} className="fade-in-up" style={{ animationDelay: "0ms" }}>
        <Tabs
          defaultActiveKey="cuenta"
          size="middle"
          tabPlacement={isMobile ? "top" : "start"}
          items={TABS.map(({ key, label, icon, children }) => ({
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
