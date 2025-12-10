import { Button, Card, Col, Popconfirm, Row } from "antd";
import { deleteAllMovements } from "../../apis/movement/ExpenseApi";
import { useMutation } from "@tanstack/react-query";
import { DeleteOutlined } from "@ant-design/icons";

export default function SettingAccount() {
  const deleteAllMovementsMutation = useMutation({
    mutationFn: () => {
      return deleteAllMovements();
    },
    onSuccess: () => {
      console.debug("✅ Movimientos eliminados correctamente");
    },
    onError: (err) => {
      console.error("❌ Error eliminado todos los movimientos", err);
    },
  });

  return (
    <Card title="Configuración de la cuenta" style={{ marginTop: 16 }}>
      <Row style={{ marginBottom: 12 }}>
        <Col span={24}>
          <Popconfirm
            title="¿Estás seguro de que quieres eliminar todos los movimientos?"
            onConfirm={() => deleteAllMovementsMutation.mutate()}
            okText="Sí"
            cancelText="No"
            placement="top"
          >
            <Button
              icon={
                <DeleteOutlined style={{ fontSize: 22, cursor: "pointer" }} />
              }
              block
              color="danger"
              variant="outlined"
            >
              Eliminar Todos los Movimientos
            </Button>
          </Popconfirm>
        </Col>
      </Row>

      <Row style={{ marginBottom: 12 }}>
        <Col span={24}>
          <Button block color="danger" variant="outlined">
            Eliminar La cuenta
          </Button>
        </Col>
      </Row>
    </Card>
  );
}
