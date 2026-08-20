import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SettingIncome } from "@/components/settings/SettingIncome";
import { Col, Flex, Grid, Row, Tabs } from "antd";
import { SettingCurrentWorkspace } from "@/components/settings/SettingCurrentWorkspace";
import { SettingInviteWorkspaces } from "@/components/settings/SettingInviteWorkspaces";
import { protectedRouteGuard } from "@/apis/auth/protectedRouteGuard";
import { RoleEnum } from "@/enums/RoleEnum";
import SettingAccount from "@/components/settings/SettingAccount";
import { SettingBank } from "@/components/settings/SettingBank";
import { SettingCurrency } from "@/components/settings/SettingCurrency";
import UserOutlined from "@ant-design/icons/UserOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import WalletOutlined from "@ant-design/icons/WalletOutlined";
import BellOutlined from "@ant-design/icons/BellOutlined";
import { SettingCategory } from "@/components/settings/SettingCategory";
import { SettingPreferences } from "@/components/settings/SettingPreferences";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { getEntityLabels } from "@/utils/entityLabels";

const { useBreakpoint } = Grid;

const SETTINGS_TAB_KEYS = ["cuenta", "workspace", "finanzas", "preferencias"] as const;
type SettingsTabKey = (typeof SETTINGS_TAB_KEYS)[number];

type SettingsSearch = {
  tab?: SettingsTabKey;
};

export const Route = createFileRoute("/settings")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  validateSearch: (search: Record<string, unknown>): SettingsSearch => ({
    tab: SETTINGS_TAB_KEYS.includes(search.tab as SettingsTabKey)
      ? (search.tab as SettingsTabKey)
      : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const screens = useBreakpoint();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null, t);
  const { tab } = Route.useSearch();
  const navigate = useNavigate();

  const TABS = [
    {
      key: "cuenta",
      label: t("settings.tabs.account"),
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
          <SettingIncome />
        </Flex>
      ),
    },
    {
      key: "preferencias",
      label: t("settings.tabs.preferences"),
      icon: <BellOutlined />,
      children: <SettingPreferences />,
    },
  ];

  return (
    <Row justify="center" style={{ paddingTop: 30 }}>
      <Col xs={24} md={20} lg={16} className="fade-in-up" style={{ animationDelay: "0ms" }}>
        <Tabs
          activeKey={tab ?? "cuenta"}
          onChange={(key) =>
            void navigate({ to: "/settings", search: { tab: key as SettingsTabKey } })
          }
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
