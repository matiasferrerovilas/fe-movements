import { createFileRoute } from "@tanstack/react-router";
import { SettingIngreso } from "../components/settings/SettingIngreso";
import { Col, Flex, Grid, Row, Tabs } from "antd";
import { SettingGroups } from "../components/settings/SettingGroups";
import { SettingInviteGroups } from "../components/settings/SettingInviteGroups";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";
import SettingAccount from "../components/settings/SettingAccount";
import { SettingBank } from "../components/settings/SettingBank";
import { SettingCurrency } from "../components/settings/SettingCurrency";
import { UserOutlined, TeamOutlined, WalletOutlined, TagOutlined } from "@ant-design/icons";
import { SettingCategory } from "../components/settings/SettingCategory";

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
    key: "grupos",
    label: "Grupos",
    icon: <TeamOutlined />,
    children: (
      <Flex vertical gap={16}>
        <SettingInviteGroups />
        <SettingGroups />
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
