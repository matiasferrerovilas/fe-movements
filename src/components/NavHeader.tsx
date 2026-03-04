import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Menu,
  type MenuProps,
  Typography,
} from "antd";
import BookOutlined from "@ant-design/icons/BookOutlined";
import LineChartOutlined from "@ant-design/icons/LineChartOutlined";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import PieChartOutlined from "@ant-design/icons/PieChartOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useKeycloak } from "@react-keycloak/web";
import { useRouter } from "@tanstack/react-router";
import { Header } from "antd/es/layout/layout";
import { useUserRoles } from "../apis/hooks/useUserRole";
import { RoleEnum } from "../enums/RoleEnum";

const { Text } = Typography;
const { useBreakpoint } = Grid;

type SideBarItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  roles?: string[];
};

const NAV_ITEMS: SideBarItem[] = [
  {
    key: "balance",
    icon: <PieChartOutlined />,
    label: "Balance",
    path: "/balance",
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  },
  {
    key: "servicios",
    icon: <BookOutlined />,
    label: "Servicios",
    path: "/services",
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  },
  {
    key: "expenses",
    icon: <LineChartOutlined />,
    label: "Gastos",
    path: "/movement",
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "Settings",
    path: "/settings",
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  },
];

export default function NavHeader() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { keycloak } = useKeycloak();
  const user = keycloak?.tokenParsed;
  const username = user?.preferred_username;
  const email = user?.email;

  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const { hasAnyRole } = useUserRoles();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles?.length || hasAnyRole(...(item.roles ?? [])),
  );

  const getActiveKey = () =>
    visibleItems.find((i) => i.path === currentPath)?.key || "balance";
  const [active, setActive] = useState(getActiveKey());
  useEffect(() => setActive(getActiveKey()), [currentPath]);

  const handleClick = (item: SideBarItem) => {
    setActive(item.key);
    setDrawerOpen(false);
    router.navigate({ to: item.path });
  };

  const dropdownItems: MenuProps["items"] = [
    {
      key: "logout",
      label: "Cerrar sesión",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => keycloak.logout(),
    },
  ];

  const UserAvatar = (
    <Dropdown
      menu={{ items: dropdownItems }}
      placement="bottomRight"
      styles={{ root: { marginTop: 8 } }}
      trigger={["click"]}
    >
      <Flex align="center" gap={10} style={{ cursor: "pointer" }}>
        {!isMobile && (
          <Flex vertical align="flex-end">
            <Text strong style={{ fontSize: 13, lineHeight: 1.3 }}>
              {username}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {email}
            </Text>
          </Flex>
        )}
        <Avatar
          size={36}
          icon={<UserOutlined />}
          style={{ backgroundColor: "#4f9cf7", flexShrink: 0 }}
        />
      </Flex>
    </Dropdown>
  );

  return (
    <>
      <Header
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          zIndex: 100,
          background: "#fff",
          padding: "0 16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        {/* Mobile: hamburger + avatar */}
        {isMobile ? (
          <>
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20 }} />}
              onClick={() => setDrawerOpen(true)}
            />
            {UserAvatar}
          </>
        ) : (
          <>
            {/* Desktop: nav centrado + avatar */}
            <div style={{ flex: 1 }} />
            <Menu
              mode="horizontal"
              selectedKeys={[active]}
              style={{
                border: "none",
                background: "transparent",
                flex: "0 0 auto",
              }}
              items={visibleItems.map((item) => ({
                key: item.key,
                icon: item.icon,
                label: item.label,
                onClick: () => handleClick(item),
              }))}
            />
            <Flex style={{ flex: 1 }} justify="flex-end">
              {UserAvatar}
            </Flex>
          </>
        )}
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Flex vertical>
            <Text strong>{username}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {email}
            </Text>
          </Flex>
        }
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size={240}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[active]}
          style={{ border: "none", paddingTop: 8 }}
          items={visibleItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => handleClick(item),
          }))}
        />
        <div style={{ padding: "16px 16px 0" }}>
          <Button
            block
            danger
            icon={<LogoutOutlined />}
            onClick={() => keycloak.logout()}
          >
            Cerrar sesión
          </Button>
        </div>
      </Drawer>
    </>
  );
}
