import {
  Button,
  Card,
  Divider,
  Flex,
  Popconfirm,
  theme,
  Typography,
} from "antd";
import { deleteAllMovements } from "../../apis/movement/ExpenseApi";
import { useMutation } from "@tanstack/react-query";
import { DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import { useCurrentUser } from "../../apis/hooks/useCurrentUser";
import { getEntityLabels } from "../utils/entityLabels";

const { Text } = Typography;

export default function SettingAccount() {
  const { token } = theme.useToken();
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null);

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
            Configuración de la cuenta
          </Typography.Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {labels.settingsCuentaAcciones}
          </Text>
        </div>
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      <Flex vertical gap={12}>
        <Popconfirm
          title="¿Estás seguro?"
          description="Se eliminarán todos los movimientos permanentemente."
          onConfirm={() => deleteAllMovementsMutation.mutate()}
          okText="Sí, eliminar"
          cancelText="Cancelar"
          placement="top"
        >
          <Button
            icon={<DeleteOutlined />}
            block
            color="danger"
            variant="outlined"
            loading={deleteAllMovementsMutation.isPending}
          >
            Eliminar todos los movimientos
          </Button>
        </Popconfirm>

        <Button
          block
          color="danger"
          variant="outlined"
          icon={<DeleteOutlined />}
        >
          Eliminar la cuenta
        </Button>
      </Flex>
    </Card>
  );
}
