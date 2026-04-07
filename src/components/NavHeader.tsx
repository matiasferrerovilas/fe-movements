import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Menu,
  type MenuProps,
  Segmented,
  theme,
  Typography,
} from "antd";
import BookOutlined from "@ant-design/icons/BookOutlined";
import LineChartOutlined from "@ant-design/icons/LineChartOutlined";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import MoonOutlined from "@ant-design/icons/MoonOutlined";
import PieChartOutlined from "@ant-design/icons/PieChartOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import SunOutlined from "@ant-design/icons/SunOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useKeycloak } from "@react-keycloak/web";
import { useRouter } from "@tanstack/react-router";
import { Header } from "antd/es/layout/layout";
import { useUserRoles } from "../apis/hooks/useUserRole";
import { RoleEnum } from "../enums/RoleEnum";
import { useTheme } from "../apis/theme/ThemeContext";

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
    label: "Ajustes",
    path: "/settings",
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  },
];

// ── NavSlider ──────────────────────────────────────────────────────────────

interface NavSliderProps {
  items: SideBarItem[];
  activeKey: string;
  onSelect: (item: SideBarItem) => void;
  token: ReturnType<typeof theme.useToken>["token"];
}

function NavSlider({ items, activeKey, onSelect, token }: NavSliderProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [barStyle, setBarStyle] = useState({ left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const idx = items.findIndex((i) => i.key === activeKey);
    const el = itemRefs.current[idx];
    if (!el) return;
    setBarStyle({ left: el.offsetLeft, width: el.offsetWidth });
    if (!mounted) setMounted(true);
  }, [activeKey, items, mounted]);

  return (
    <nav
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 0,
        flex: "0 0 auto",
      }}
    >
      {items.map((item, idx) => {
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            ref={(el) => { itemRefs.current[idx] = el; }}
            onClick={() => onSelect(item)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 16px",
              height: 56,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: isActive ? token.colorPrimary : token.colorTextSecondary,
              fontSize: token.fontSize,
              fontFamily: "inherit",
              fontWeight: isActive ? 600 : 400,
              transition: `color 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                           font-weight 0.25s cubic-bezier(0.25, 1, 0.5, 1)`,
              whiteSpace: "nowrap",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = token.colorText;
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = token.colorTextSecondary;
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1, display: "flex" }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}

      {/* Sliding indicator bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          height: 2,
          backgroundColor: token.colorPrimary,
          borderRadius: "1px 1px 0 0",
          left: barStyle.left,
          width: barStyle.width,
          transition: mounted
            ? "left 0.35s cubic-bezier(0.25, 1, 0.5, 1), width 0.35s cubic-bezier(0.25, 1, 0.5, 1)"
            : "none",
          pointerEvents: "none",
        }}
      />
    </nav>
  );
}

// ── NavHeader ──────────────────────────────────────────────────────────────

export default function NavHeader() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { keycloak } = useKeycloak();
  const user = keycloak?.tokenParsed;
  const username = user?.preferred_username;
  const email = user?.email;
  const { token } = theme.useToken();
  const { isDark, toggleTheme } = useTheme();

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

  // Sync active key when route changes without calling setState in an effect
  const activeKey = getActiveKey();
  if (active !== activeKey) {
    setActive(activeKey);
  }

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

  const ThemeToggle = (
    <Segmented
      value={isDark ? "dark" : "light"}
      onChange={(v) => {
        if (v !== (isDark ? "dark" : "light")) toggleTheme();
      }}
      shape="round"
      options={[
        { label: <SunOutlined />, value: "light" },
        { label: <MoonOutlined />, value: "dark" },
      ]}
    />
  );

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
          style={{ backgroundColor: token.colorPrimary, flexShrink: 0 }}
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
          background: token.colorBgContainer,
          padding: "0 16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        {/* Mobile: hamburger + logo + theme toggle + avatar */}
        {isMobile ? (
          <>
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20 }} />}
              onClick={() => setDrawerOpen(true)}
            />
            <button
              onClick={() => router.navigate({ to: "/" })}
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              <img src="/favicon.png" alt="Movements" style={{ height: 40, width: 40 }} />
            </button>
            <Flex align="center" gap={4}>
              {ThemeToggle}
              {UserAvatar}
            </Flex>
          </>
        ) : (
          <>
            {/* Desktop: logo izquierda + nav centrado + theme toggle + avatar */}
            <Flex style={{ flex: 1 }} align="center">
              <button
                onClick={() => router.navigate({ to: "/" })}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img src="/favicon.png" alt="Movements" style={{ height: 40, width: 40 }} />
              </button>
            </Flex>
            <NavSlider
              items={visibleItems}
              activeKey={active}
              onSelect={handleClick}
              token={token}
            />
            <Flex style={{ flex: 1 }} justify="flex-end" align="center" gap={8}>
              {ThemeToggle}
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
          <Flex gap={8} style={{ marginBottom: 8 }}>
            {ThemeToggle}
            <Text type="secondary" style={{ lineHeight: "32px", fontSize: 13 }}>
              {isDark ? "Modo oscuro" : "Modo claro"}
            </Text>
          </Flex>
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
