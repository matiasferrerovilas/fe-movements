import { createFileRoute } from "@tanstack/react-router";
import { SettingIngreso } from "../components/settings/SettingIngreso";
import { Col, Flex, Grid, Row, Tabs } from "antd";
import { SettingCurrentWorkspace } from "../components/settings/SettingCurrentWorkspace";
import { SettingInviteWorkspaces } from "../components/settings/SettingInviteWorkspaces";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";
import SettingAccount from "../components/settings/SettingAccount";
import { SettingBank } from "../components/settings/SettingBank";
import { SettingCurrency } from "../components/settings/SettingCurrency";
import { UserOutlined, TeamOutlined, WalletOutlined, BellOutlined } from "@ant-design/icons";
import { SettingCategory } from "../components/settings/SettingCategory";
import { SettingPreferences } from "../components/settings/SettingPreferences";
import { useCurrentUser } from "../apis/hooks/useCurrentUser";
import { getEntityLabels } from "../components/utils/entityLabels";

const { useBreakpoint } = Grid;

export const Route = createFileRoute("/settings")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const screens = useBreakpoint();
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null);

  const TABS = [
    {
      key: "cuenta",
      label: "Cuenta",
      icon: <UserOutlined />,
      children: <SettingAccount />,
    },
    {
      key: "workspace",
      label: labels.settingsTabWorkspace,
      icon: <TeamOutlined />,
      children: (
        <Flex vertical gap={16}>
          <SettingInviteWorkspaces />
          <SettingCurrentWorkspace />
          <SettingCategory />
        </Flex>
      ),
    },
    {
      key: "finanzas",
      label: labels.settingsTabFinanzas,
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
      key: "preferencias",
      label: "Preferencias",
      icon: <BellOutlined />,
      children: <SettingPreferences />,
    },
  ];

  return (
    <Row justify="center" style={{ paddingTop: 30 }}>
      <Col xs={24} md={20} lg={16} className="fade-in-up" style={{ animationDelay: "0ms" }}>
        <Tabs
          defaultActiveKey="cuenta"
          size="middle"
          tabPlacement={screens.md ? "start" : "top"}
          items={TABS.map(({ key, label, icon, children }) => ({
            key,
            label: (
              <span>
                {icon} {label}
              </span>
            ),
            children: (
              <div style={{ paddingTop: screens.md ? 0 : 12 }}>{children}</div>
            ),
          }))}
        />
      </Col>
    </Row>
  );
}
