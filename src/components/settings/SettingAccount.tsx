import {
  Button,
  Card,
  Divider,
  Flex,
  Popconfirm,
  theme,
  Typography,
} from "antd";
import { deleteAllMovements } from "@/apis/movement/MovementApi";
import { useMutation } from "@tanstack/react-query";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { getEntityLabels } from "@/utils/entityLabels";

const { Text } = Typography;

export default function SettingAccount() {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null, t);

  const deleteAllMovementsMutation = useMutation({
    mutationFn: () => deleteAllMovements(),
    onSuccess: () => console.debug("✅ Movimientos eliminados correctamente"),
    onError: (err) =>
      console.error("❌ Error eliminado todos los movimientos", err),
  });

  return (
    <Card style={{ borderRadius: token.borderRadiusLG }}>
      {/* Header */}
      <Flex align="center" gap={12} style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: token.borderRadius,
            background: token.colorError,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SettingOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {t("settings.account.title")}
          </Typography.Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {labels.settingsCuentaAcciones}
          </Text>
        </div>
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      <Flex vertical gap={12}>
        <Popconfirm
          title={t("settings.account.deleteAllConfirmTitle")}
          description={t("settings.account.deleteAllConfirmDescription")}
          onConfirm={() => deleteAllMovementsMutation.mutate()}
          okText={t("settings.account.deleteAllConfirmOk")}
          cancelText={t("settings.account.deleteAllConfirmCancel")}
          placement="top"
        >
          <Button
            icon={<DeleteOutlined />}
            block
            color="danger"
            variant="outlined"
            loading={deleteAllMovementsMutation.isPending}
          >
            {t("settings.account.deleteAllButton")}
          </Button>
        </Popconfirm>

        <Button
          block
          color="danger"
          variant="outlined"
          icon={<DeleteOutlined />}
        >
          {t("settings.account.deleteAccountButton")}
        </Button>
      </Flex>
    </Card>
  );
}
