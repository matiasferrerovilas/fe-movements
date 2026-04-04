import { DeleteOutlined, PlusOutlined, TagOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Space,
  Tooltip,
  Typography,
} from "antd";
import {
  useAddCategory,
  useCategory,
  useDeleteCategory,
} from "../../apis/hooks/useCategory";
import type { Category } from "../../models/Category";

const { Title, Text } = Typography;

const css = `
  .category-card {
    border-radius: 16px !important;
    transition: all 0.25s ease !important;
    overflow: hidden;
  }
  .category-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.09) !important;
  }
  .category-card-item {
    background: #f7f8fa !important;
    border: 1.5px solid #e8eaed !important;
  }
  .category-delete-btn {
    border-radius: 50% !important;
    width: 34px !important;
    height: 34px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    transition: all 0.2s ease !important;
  }
  .category-delete-btn:not(:disabled):hover {
    background: #fff1f0 !important;
    transform: scale(1.18);
  }
  .create-category-card {
    border-radius: 14px !important;
    border: 1.5px dashed #c4b5fd !important;
    background: linear-gradient(135deg, #faf8ff 0%, #f3eeff 100%) !important;
    margin-bottom: 20px;
  }
  .create-category-input {
    background: #fff !important;
    border: 1.5px solid #ede9fe !important;
    border-radius: 10px !important;
    height: 40px !important;
    font-size: 14px !important;
    transition: border-color 0.2s !important;
  }
  .create-category-input:focus, .create-category-input:hover {
    border-color: #7c3aed !important;
  }
  .create-category-btn {
    height: 40px !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    background: linear-gradient(90deg, #7c3aed, #a78bfa) !important;
    border: none !important;
    color: #fff !important;
    box-shadow: 0 2px 10px rgba(124, 58, 237, 0.25) !important;
    transition: all 0.2s ease !important;
  }
  .create-category-btn:hover {
    opacity: 0.88 !important;
    transform: translateY(-1px) !important;
  }
`;

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

interface AddCategoryForm {
  description: string;
}

interface CategoryCardProps {
  category: Category;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

function CategoryCard({ category, onDelete, isDeleting }: CategoryCardProps) {
  return (
    <Card
      hoverable
      className="category-card category-card-item"
      styles={{ body: { padding: "14px 18px", cursor: "default" } }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.28)",
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
              color: "#1f2937",
              letterSpacing: "-0.2px",
              lineHeight: 1,
            }}
          >
            {capitalize(category.description)}
          </Text>
        </div>
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
                className="category-delete-btn"
                disabled={!category.isDeletable || isDeleting}
                icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      </div>
    </Card>
  );
}

export function SettingCategory() {
  const { data: categories = [], isLoading } = useCategory();
  const addCategoryMutation = useAddCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const [form] = Form.useForm<AddCategoryForm>();

  const onFinish = (values: AddCategoryForm) => {
    addCategoryMutation.mutate(values.description, {
      onSuccess: () => form.resetFields(),
    });
  };

  return (
    <>
      <style>{css}</style>
      <Card loading={isLoading} style={{ borderRadius: 16 }}>
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
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 10px rgba(124, 58, 237, 0.25)",
            }}
          >
            <TagOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, color: "#3b0764" }}>
              Mis Categorías
            </Title>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              Agregá y gestioná tus categorías personales.
            </Text>
          </div>
        </div>

        <div style={{ height: 1, background: "#f3eeff", margin: "14px 0" }} />

        {/* Agregar categoría */}
        <Card
          className="create-category-card"
          styles={{ body: { padding: "14px 16px" } }}
        >
          <Text
            strong
            style={{
              fontSize: 13,
              color: "#374151",
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
                    className="create-category-input"
                    placeholder="Nombre de la categoría..."
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Button
                  icon={<PlusOutlined />}
                  block
                  htmlType="submit"
                  className="create-category-btn"
                  loading={addCategoryMutation.isPending}
                >
                  Agregar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Lista de categorías */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categories.map((category: Category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onDelete={(id) => deleteCategoryMutation.mutate(id)}
              isDeleting={deleteCategoryMutation.isPending}
            />
          ))}
        </div>
      </Card>
    </>
  );
}
