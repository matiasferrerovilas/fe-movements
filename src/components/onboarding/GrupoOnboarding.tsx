import PlusOutlined from "@ant-design/icons/PlusOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { Button, Col, Form, Input, Row, Space, Typography } from "antd";
import type { OnboardingForm } from "../../apis/onboarding/OnBoarding";

const { Text } = Typography;

interface Props {
  initialValues: Partial<OnboardingForm>;
  onNext: (values: Pick<OnboardingForm, "accountsToAdd">) => void;
}

export default function GrupoOnboarding({ initialValues, onNext }: Props) {
  const [form] = Form.useForm<{ accountsToAdd: string[] }>();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      // Filtramos entradas vacías — si no hay ninguna, enviamos [] (sin grupo custom)
      const filled = (values.accountsToAdd || []).filter(
        (g: string) => g && g.trim(),
      );
      onNext({ accountsToAdd: filled });
    }).catch(() => {
      // validación fallida — Ant Design muestra los errores en el form
    });
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          ¿Querés crear algunos workspaces?
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          Un workspace sirve para agrupar movimientos.
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          Por defecto se crea uno para tus movimientos propios.
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ accountsToAdd: initialValues.accountsToAdd || [""] }}
        style={{ width: "100%" }}
      >
        <Form.List name="accountsToAdd">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row gutter={8} key={key} align="top">
                  <Col flex="auto">
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value || !value.trim()) return Promise.resolve();
                            if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
                              return Promise.reject(
                                new Error("Solo se permiten letras y espacios"),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nombre del workspace"
                        style={{ borderRadius: 8 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        aria-label="Eliminar workspace"
                      />
                    )}
                  </Col>
                </Row>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Agregar workspace
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12, textAlign: "center" }}>
          Si no querés crear workspaces ahora, dejá el campo vacío y hacé click en Siguiente.
        </Text>

        <Row gutter={[16, 10]}>
          <Col xs={24}>
            <Button color="geekblue" block onClick={handleSubmit} variant="filled">
              Siguiente
            </Button>
          </Col>
        </Row>
      </Form>
    </Space>
  );
}
