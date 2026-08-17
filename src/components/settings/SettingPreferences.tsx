import DollarOutlined from "@ant-design/icons/DollarOutlined";
import { Card, Divider, Flex, Switch, theme, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useUserDefault, useSetUserDefault } from "@/apis/hooks/useSettings";

const { Title, Text } = Typography;

export function SettingPreferences() {
  const { data: autoIncomeSetting, isLoading } =
    useUserDefault("AUTO_INCOME_ENABLED");
  const setDefault = useSetUserDefault();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const isAutoIncomeEnabled = autoIncomeSetting?.value === 1;

  const handleAutoIncomeChange = (checked: boolean) => {
    setDefault.mutate({ key: "AUTO_INCOME_ENABLED", value: checked ? 1 : 0 });
  };

  return (
    <Card loading={isLoading} style={{ borderRadius: 16 }}>
      {/* Header - Automatización */}
      <Flex align="center" gap={10} style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${token.colorSuccess}, ${token.colorSuccessHover})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 10px ${token.colorSuccessBorder}`,
          }}
        >
          <DollarOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {t("settings.preferences.title")}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("settings.preferences.subtitle")}
          </Text>
        </div>
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      {/* Ingresos automáticos */}
      <Flex align="center" justify="space-between" gap={16}>
        <Flex vertical gap={2}>
          <Text strong style={{ fontSize: 14 }}>
            {t("settings.preferences.autoIncomeLabel")}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("settings.preferences.autoIncomeDescription")}
          </Text>
        </Flex>
        <Switch
          checked={isAutoIncomeEnabled}
          loading={setDefault.isPending}
          onChange={handleAutoIncomeChange}
        />
      </Flex>
    </Card>
  );
}
