import { createFileRoute } from "@tanstack/react-router";
import { SettingIngreso } from "../components/settings/SettingIngreso";
import { Col, Row, Tabs } from "antd";
import { SettingGroups } from "../components/settings/SettingGroups";
import { SettingInviteGroups } from "../components/settings/SettingInviteGroups";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";
import SettingAccount from "../components/settings/SettingAccount";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";

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
    children: (
      <>
        <SettingIngreso />
        <div style={{ marginTop: 16 }}>
          <SettingAccount />
        </div>
      </>
    ),
  },
  {
    key: "grupos",
    label: "Grupos",
    icon: <TeamOutlined />,
    children: (
      <>
        <SettingInviteGroups />
        <div style={{ marginTop: 16 }}>
          <SettingGroups />
        </div>
      </>
    ),
  },
];

function RouteComponent() {
  return (
    <Row justify="center" style={{ paddingTop: 30 }}>
      <Col xs={24} md={20} lg={16}>
        <Tabs
          tabPlacement="start"
          defaultActiveKey="cuenta"
          size="middle"
          items={TABS.map(({ key, label, icon, children }) => ({
            key,
            label: (
              <span>
                {icon}
                {label}
              </span>
            ),
            children: <div style={{ paddingTop: 16 }}>{children}</div>,
          }))}
        />
      </Col>
    </Row>
  );
}
