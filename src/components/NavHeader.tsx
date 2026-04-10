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
  Tag,
  theme,
  Typography,
} from "antd";
import BookOutlined from "@ant-design/icons/BookOutlined";
import FundOutlined from "@ant-design/icons/FundOutlined";
import LineChartOutlined from "@ant-design/icons/LineChartOutlined";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import MoonOutlined from "@ant-design/icons/MoonOutlined";
import PieChartOutlined from "@ant-design/icons/PieChartOutlined";
import SafetyOutlined from "@ant-design/icons/SafetyOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import SunOutlined from "@ant-design/icons/SunOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useKeycloak } from "@react-keycloak/web";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { Header } from "antd/es/layout/layout";
import { useCurrentUser } from "../apis/hooks/useCurrentUser";
import { useUserRoles } from "../apis/hooks/useUserRole";
import { RoleEnum } from "../enums/RoleEnum";
import { useTheme } from "../apis/theme/ThemeContext";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const USER_TYPE_COLOR: Record<string, string> = {
  CONSUMER: "blue",
  COMPANY: "green",
};

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
    key: "budgets",
    icon: <FundOutlined />,
    label: "Presupuestos",
    path: "/budgets",
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
  {
    key: "admin",
    icon: <SafetyOutlined />,
    label: "Admin",
    path: "/admin",
    roles: [RoleEnum.ADMIN],
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
    if (!el) {
      setBarStyle({ left: 0, width: 0 });
      return;
    }
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
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const { hasAnyRole } = useUserRoles();
  const { data: currentUser } = useCurrentUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles?.length || hasAnyRole(...(item.roles ?? [])),
  );

  const isHome = currentPath === "/";
  const activeKey = visibleItems.find((i) => i.path === currentPath)?.key ?? "";

  const handleClick = (item: SideBarItem) => {
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
            <Text type="secondary" style={{ fontSize: 11 }}>
              {email}
            </Text>
            {currentUser?.userType && (
              <Tag
                color={USER_TYPE_COLOR[currentUser.userType] ?? "default"}
                style={{ marginTop: 2, marginInlineEnd: 0, fontSize: 10, lineHeight: "16px", padding: "0 5px" }}
              >
                {currentUser.userType}
              </Tag>
            )}
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
                padding: 4,
                display: "flex",
                alignItems: "center",
                borderRadius: token.borderRadiusSM,
                outline: isHome ? `2px solid ${token.colorPrimary}` : "none",
                outlineOffset: 2,
                transition: "outline 0.2s",
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
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: token.borderRadiusSM,
                  outline: isHome ? `2px solid ${token.colorPrimary}` : "none",
                  outlineOffset: 2,
                  transition: "outline 0.2s",
                }}
              >
                <img src="/favicon.png" alt="Movements" style={{ height: 40, width: 40 }} />
              </button>
            </Flex>
            <NavSlider
              items={visibleItems}
              activeKey={activeKey}
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
            {currentUser?.userType && (
              <Tag
                color={USER_TYPE_COLOR[currentUser.userType] ?? "default"}
                style={{ marginTop: 4, alignSelf: "flex-start", fontSize: 11 }}
              >
                {currentUser.userType}
              </Tag>
            )}
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
          selectedKeys={[activeKey]}
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
