import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { Button, Col, Form, Input, Row, Space, Typography } from "antd";
const { Text } = Typography;
interface Props {
  initialValues: any;
  onNext: (values: any) => void;
}

export default function GrupoOnboarding({ initialValues, onNext }: Props) {
  const [form] = Form.useForm<{ accountsToAdd: string[] }>();

  const handleSubmit = () => {
    form.validateFields().then((values) => onNext(values));
  };

  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          ¿Quiere crear algunos grupos?
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          Un grupo sirve para agrupar movimientos.
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          Por Default se crea uno para los movimientos propios
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
                <Row gutter={8} key={key}>
                  <Col flex="auto">
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value || !value.trim())
                              return Promise.resolve();
                            if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
                              return Promise.reject(
                                new Error("Solo se permiten letras y espacios")
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input
                        placeholder="Nombre del Grupo"
                        style={{ borderRadius: 8 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    {fields.length > 1 && (
                      <Button type="text" danger onClick={() => remove(name)}>
                        ❌
                      </Button>
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
                  Agregar Grupo
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Col xs={24} md={18} lg={24}>
          <Button
            color="geekblue"
            block
            onClick={handleSubmit}
            variant="filled"
          >
            Siguiente
          </Button>
        </Col>
        <Col xs={24} md={18} lg={24} style={{ paddingTop: 10 }}>
          <Button type="dashed" block onClick={handleSubmit}>
            Omitir Por Ahora
          </Button>
        </Col>
      </Form>
    </Space>
  );
}
