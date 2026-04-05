import PlusOutlined from "@ant-design/icons/PlusOutlined";
import TagOutlined from "@ant-design/icons/TagOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import {
  Button,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import { useState } from "react";

const { Text } = Typography;

interface Props {
  initialValues: { categoriesToAdd?: string[] };
  onNext: (values: { categoriesToAdd: string[] }) => void;
  onPrev: () => void;
}

export default function CategoriaOnboarding({ initialValues, onNext, onPrev }: Props) {
  const { token } = theme.useToken();
  const [form] = Form.useForm<{ description: string }>();
  const [categories, setCategories] = useState<string[]>(
    initialValues.categoriesToAdd ?? [],
  );

  const handleAdd = () => {
    form.validateFields().then(({ description }) => {
      const trimmed = description.trim();
      if (!trimmed || categories.includes(trimmed.toUpperCase())) return;
      setCategories((prev) => [...prev, trimmed.toUpperCase()]);
      form.resetFields();
    }).catch(() => {});
  };

  const handleRemove = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          Agregá las categorías con las que clasificás tus gastos.
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          Ya hay algunas por defecto — podés agregar las tuyas.
        </Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleAdd}>
        <Row gutter={[12, 0]} align="middle">
          <Col flex="auto">
            <Form.Item
              name="description"
              style={{ margin: 0 }}
              rules={[
                { required: true, message: "Ingresá el nombre de la categoría" },
                {
                  validator: (_, value) => {
                    if (!value || !value.trim()) return Promise.resolve();
                    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
                      return Promise.reject(new Error("Solo letras y espacios"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder="Nombre de la categoría..."
                style={{ borderRadius: 10, height: 40 }}
              />
            </Form.Item>
          </Col>
          <Col>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              htmlType="submit"
              style={{ height: 40, borderRadius: 10, fontWeight: 600 }}
            >
              Agregar
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Lista de categorías agregadas */}
      <div
        style={{
          minHeight: 80,
          padding: "12px 14px",
          borderRadius: 12,
          border: `1.5px dashed ${token.colorBorderSecondary}`,
          background: token.colorFillAlter,
        }}
      >
        {categories.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                No agregaste categorías aún. Podés continuar sin agregar.
              </Text>
            }
            style={{ margin: "8px 0" }}
          />
        ) : (
          <Flex wrap gap={8}>
            {categories.map((cat) => (
              <Tag
                key={cat}
                closeIcon={<DeleteOutlined />}
                onClose={() => handleRemove(cat)}
                icon={<TagOutlined />}
                color="blue"
                style={{ fontSize: 13, padding: "4px 10px", borderRadius: 8 }}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </Tag>
            ))}
          </Flex>
        )}
      </div>

      <Text
        type="secondary"
        style={{ fontSize: 12, display: "block", textAlign: "center" }}
      >
        Podés agregar más categorías desde Configuración en cualquier momento.
      </Text>

      <Row gutter={[16, 10]}>
        <Col xs={12}>
          <Button block type="default" onClick={onPrev}>
            Volver
          </Button>
        </Col>
        <Col xs={12}>
          <Button
            block
            color="geekblue"
            variant="filled"
            onClick={() => onNext({ categoriesToAdd: categories })}
          >
            Siguiente
          </Button>
        </Col>
      </Row>
    </Space>
  );
}
