import { DeleteOutlined, PlusOutlined, TagOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Popconfirm,
  Row,
  Space,
  theme,
  Tooltip,
  Typography,
} from "antd";
import {
  useAddCategory,
  useCategory,
  useDeleteCategory,
} from "../../apis/hooks/useCategory";
import type { Category } from "../../models/Category";
import { SettingCategoryMigrate } from "./SettingCategoryMigrate";

const { Title, Text } = Typography;

interface AddCategoryForm {
  description: string;
}

interface CategoryCardProps {
  category: Category;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

function CategoryCard({ category, onDelete, isDeleting }: CategoryCardProps) {
  const { token } = theme.useToken();

  return (
    <Card
      hoverable
      styles={{ body: { padding: "14px 18px", cursor: "default" } }}
      style={{
        borderRadius: 16,
        border: `1.5px solid ${token.colorBorderSecondary}`,
        background: token.colorFillAlter,
        transition: "all 0.25s ease",
        overflow: "hidden",
      }}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={14}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 14px ${token.colorPrimaryBorder}`,
              flexShrink: 0,
              transition: "all 0.25s ease",
            }}
          >
            <TagOutlined style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <Text
            strong
            style={{
              fontSize: 15,
              color: token.colorText,
              letterSpacing: "-0.2px",
              lineHeight: 1,
            }}
          >
            {category.description}
          </Text>
        </Flex>
        <Space size={4}>
          <Tooltip
            title={
              !category.isDeletable
                ? "Esta categoría no se puede eliminar"
                : "Eliminar categoría"
            }
          >
            <Popconfirm
              title="¿Eliminar esta categoría?"
              description="Se quitará de tu lista personal."
              onConfirm={() => onDelete(category.id)}
              okText="Eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
              disabled={!category.isDeletable}
            >
              <Button
                type="text"
                danger
                aria-label={`Eliminar categoría ${category.description}`}
                style={{
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                disabled={!category.isDeletable || isDeleting}
                icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      </Flex>
    </Card>
  );
}

export function SettingCategory() {
  const { data: categories = [], isLoading } = useCategory();
  const addCategoryMutation = useAddCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const [form] = Form.useForm<AddCategoryForm>();
  const { token } = theme.useToken();

  const onFinish = (values: AddCategoryForm) => {
    addCategoryMutation.mutate(values.description, {
      onSuccess: () => form.resetFields(),
    });
  };

  return (
    <>
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
            <TagOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Mis Categorías
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Agregá y gestioná tus categorías personales.
            </Text>
          </div>
        </Flex>

        <Divider style={{ margin: "14px 0" }} />

        {/* Agregar categoría */}
        <Card
          styles={{ body: { padding: "14px 16px" } }}
          style={{
            borderRadius: 14,
            border: `1.5px dashed ${token.colorPrimaryBorder}`,
            background: token.colorPrimaryBg,
            marginBottom: 20,
          }}
        >
          <Text
            strong
            style={{
              fontSize: 13,
              color: token.colorText,
              display: "block",
              marginBottom: 10,
            }}
          >
            Nueva Categoría
          </Text>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={[12, 0]} align="middle">
              <Col xs={24} sm={16} md={18}>
                <Form.Item
                  name="description"
                  style={{ margin: 0 }}
                  rules={[
                    {
                      required: true,
                      message: "Ingresá el nombre de la categoría",
                    },
                  ]}
                >
                  <Input
                    style={{
                      borderRadius: 10,
                      height: 40,
                      fontSize: 14,
                    }}
                    placeholder="Nombre de la categoría..."
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  block
                  htmlType="submit"
                  style={{ height: 40, borderRadius: 10, fontWeight: 600 }}
                  loading={addCategoryMutation.isPending}
                >
                  Agregar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Lista de categorías */}
        <Flex vertical gap={10}>
          {categories.map((category: Category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onDelete={(id) => deleteCategoryMutation.mutate(id)}
              isDeleting={deleteCategoryMutation.isPending}
            />
          ))}
        </Flex>
      </Card>

      <SettingCategoryMigrate />
    </>
  );
}
