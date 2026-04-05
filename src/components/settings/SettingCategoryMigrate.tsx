import { SwapRightOutlined, RetweetOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Popconfirm,
  Row,
  Select,
  Typography,
  App,
} from "antd";
import { useKeycloak } from "@react-keycloak/web";
import { useCategory, useMigrateCategory } from "../../apis/hooks/useCategory";

const { Title, Text } = Typography;

interface MigrateCategoryForm {
  fromCategoryId: number;
  toCategoryId: number;
}

export function SettingCategoryMigrate() {
  const { keycloak } = useKeycloak();
  const roles: string[] =
    (keycloak?.tokenParsed?.realm_access?.roles as string[]) ?? [];
  const isAdmin =
    roles.includes("ROLE_ADMIN") || roles.includes("ADMIN");

  const { data: categories = [] } = useCategory();
  const migrateMutation = useMigrateCategory();
  const [form] = Form.useForm<MigrateCategoryForm>();
  const { message } = App.useApp();

  const fromCategoryId = Form.useWatch("fromCategoryId", form);
  const toCategoryId = Form.useWatch("toCategoryId", form);

  if (!isAdmin) return null;

  const fromCategory = categories.find((c) => c.id === fromCategoryId);
  const toCategory = categories.find((c) => c.id === toCategoryId);

  const onConfirm = () => {
    form
      .validateFields()
      .then((values) => {
        migrateMutation.mutate(values, {
          onSuccess: () => {
            message.success(
              `Todos los movimientos de "${fromCategory?.description}" fueron migrados a "${toCategory?.description}".`,
            );
            form.resetFields();
          },
          onError: () => {
            message.error("Ocurrió un error al migrar la categoría.");
          },
        });
      })
      .catch(() => {});
  };

  const confirmTitle =
    fromCategory && toCategory
      ? `¿Migrar "${fromCategory.description}" → "${toCategory.description}"?`
      : "¿Confirmar migración?";

  const confirmDescription =
    "Todos tus movimientos de la categoría origen serán reasignados a la categoría destino. Esta acción no se puede deshacer.";

  return (
    <Card
      style={{
        borderRadius: 16,
        border: "1.5px dashed #f59e0b",
        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
        marginTop: 20,
      }}
      styles={{ body: { padding: "18px 20px" } }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #d97706, #f59e0b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 3px 10px rgba(217, 119, 6, 0.3)",
            flexShrink: 0,
          }}
        >
          <RetweetOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0, color: "#78350f" }}>
            Migrar Categoría
          </Title>
          <Text style={{ fontSize: 12, color: "#92400e" }}>
            Solo administradores. Reasigna todos tus movimientos de una
            categoría a otra.
          </Text>
        </div>
      </div>

      <div
        style={{ height: 1, background: "#fde68a", margin: "14px 0" }}
      />

      <Form form={form} layout="vertical">
        <Row gutter={[12, 0]} align="middle">
          <Col xs={24} sm={10}>
            <Form.Item
              name="fromCategoryId"
              label={
                <Text style={{ fontSize: 13, color: "#78350f", fontWeight: 600 }}>
                  Categoría origen
                </Text>
              }
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: "Seleccioná la categoría origen" },
              ]}
            >
              <Select
                placeholder="Seleccionar origen..."
                style={{ width: "100%" }}
                options={categories
                  .filter((c) => c.id !== toCategoryId)
                  .map((c) => ({ value: c.id, label: c.description }))}
              />
            </Form.Item>
          </Col>

          <Col
            xs={24}
            sm={4}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 22,
            }}
          >
            <SwapRightOutlined
              style={{ fontSize: 22, color: "#d97706" }}
            />
          </Col>

          <Col xs={24} sm={10}>
            <Form.Item
              name="toCategoryId"
              label={
                <Text style={{ fontSize: 13, color: "#78350f", fontWeight: 600 }}>
                  Categoría destino
                </Text>
              }
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: "Seleccioná la categoría destino" },
              ]}
            >
              <Select
                placeholder="Seleccionar destino..."
                style={{ width: "100%" }}
                options={categories
                  .filter((c) => c.id !== fromCategoryId)
                  .map((c) => ({ value: c.id, label: c.description }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <Popconfirm
            title={confirmTitle}
            description={confirmDescription}
            onConfirm={onConfirm}
            okText="Migrar"
            cancelText="Cancelar"
            okButtonProps={{
              style: {
                background: "linear-gradient(90deg, #d97706, #f59e0b)",
                border: "none",
              },
              loading: migrateMutation.isPending,
            }}
            disabled={!fromCategoryId || !toCategoryId}
          >
            <Button
              style={{
                height: 40,
                borderRadius: 10,
                fontWeight: 600,
                background: "linear-gradient(90deg, #d97706, #f59e0b)",
                border: "none",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(217, 119, 6, 0.3)",
              }}
              loading={migrateMutation.isPending}
              disabled={!fromCategoryId || !toCategoryId}
            >
              Migrar
            </Button>
          </Popconfirm>
        </div>
      </Form>
    </Card>
  );
}
