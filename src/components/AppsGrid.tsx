import { Flex, Typography, theme } from "antd";
import { useUserRoles } from "@/apis/hooks/useUserRoles";

const { Text } = Typography;

interface ExternalApp {
  key: string;
  name: string;
  icon: string;
  url: string;
}

const EXTERNAL_APPS: ExternalApp[] = [
  { key: "keep", name: "Keep", icon: "/apis/logo_keep.png", url: "https://keep.eva-core.com" },
];

export function AppsGrid() {
  const { token } = theme.useToken();
  const { hasAnyRole } = useUserRoles();

  // Keep es exclusivo de familias — un usuario GUEST no tiene workspace ahí, así que mostrarle
  // el link solo lleva a un 403 del otro lado.
  const visibleApps = EXTERNAL_APPS.filter((app) => (app.key === "keep" ? hasAnyRole("FAMILY", "ADMIN") : true));

  if (visibleApps.length === 0) return null;

  return (
    <Flex gap={8} wrap style={{ maxWidth: 168 }}>
      {visibleApps.map((app) => (
        <a
          key={app.key}
          href={app.url}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            width: 72,
            padding: 8,
            borderRadius: token.borderRadiusLG,
            color: token.colorText,
            textAlign: "center",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = token.colorFillTertiary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <img src={app.icon} alt={app.name} style={{ width: 36, height: 36, borderRadius: 8 }} />
          <Text style={{ fontSize: 11 }}>{app.name}</Text>
        </a>
      ))}
    </Flex>
  );
}
