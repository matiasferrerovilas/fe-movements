import { BellOutlined } from "@ant-design/icons";
import { Card, Divider, Flex, Switch, theme, Typography } from "antd";
import { useUserDefault, useSetUserDefault } from "../../apis/hooks/useSettings";

const { Title, Text } = Typography;

export function SettingPreferences() {
  const { data: setting, isLoading } = useUserDefault("MONTHLY_SUMMARY_ENABLED");
  const setDefault = useSetUserDefault();
  const { token } = theme.useToken();

  const isEnabled = setting?.value === 1;

  const handleChange = (checked: boolean) => {
    setDefault.mutate({ key: "MONTHLY_SUMMARY_ENABLED", value: checked ? 1 : 0 });
  };

  return (
    <Card loading={isLoading} style={{ borderRadius: 16 }}>
      {/* Header */}
      <Flex align="center" gap={10} style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 10px ${token.colorPrimaryBorder}`,
          }}
        >
          <BellOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Notificaciones
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Configurá las notificaciones que querés recibir.
          </Text>
        </div>
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      {/* Resumen mensual */}
      <Flex align="center" justify="space-between" gap={16}>
        <Flex vertical gap={2}>
          <Text strong style={{ fontSize: 14 }}>
            Resumen mensual
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Recibirás un resumen de tus gastos al final de cada mes.
          </Text>
        </Flex>
        <Switch
          checked={isEnabled}
          loading={setDefault.isPending}
          onChange={handleChange}
        />
      </Flex>
    </Card>
  );
}
