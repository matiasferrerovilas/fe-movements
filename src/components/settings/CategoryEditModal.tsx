import { Button, Divider, Flex, Form, Input, message, Modal, theme, Typography } from "antd";
import React, { useMemo } from "react";
import type { Category } from "../../models/Category";
import { useUpdateCategory } from "../../apis/hooks/useCategory";
import { ColorPicker, PRESET_COLORS } from "./ColorPicker";
import { IconPicker } from "./IconPicker";
import { getIconComponent } from "../../utils/getIconComponent";

const { Text } = Typography;

interface CategoryEditModalProps {
  category: Category | null;
  open: boolean;
  onClose: () => void;
}

interface CategoryEditForm {
  description: string;
  iconName: string;
  iconColor: string;
}

function CategoryEditModalContent({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const { token } = theme.useToken();
  const updateCategoryMutation = useUpdateCategory();

  // Valores iniciales derivados de category
  const initialValues = useMemo(
    () => ({
      description: category.description,
      iconName: category.iconName ?? "QuestionOutlined",
      iconColor: category.iconColor ?? PRESET_COLORS[0].value,
    }),
    [category.description, category.iconName, category.iconColor],
  );

  const [form] = Form.useForm<CategoryEditForm>();

  // Obtener valores actuales del form para vista previa
  const formValues = Form.useWatch([], form);
  const previewIcon = formValues?.iconName ?? initialValues.iconName;
  const previewColor = formValues?.iconColor ?? initialValues.iconColor;

  const handleSubmit = async (values: CategoryEditForm) => {
    try {
      await updateCategoryMutation.mutateAsync({
        categoryId: category.id,
        payload: {
          description: values.description,
          iconName: values.iconName,
          iconColor: values.iconColor,
        },
      });
      message.success("Categoría actualizada exitosamente");
      onClose();
    } catch (error) {
      message.error("Error al actualizar la categoría");
      console.error(error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const previewIconElement = useMemo(() => {
    const IconComponent = getIconComponent(previewIcon);
    return React.createElement(IconComponent, {
      style: {
        fontSize: 32,
        color: "#fff",
      },
    });
  }, [previewIcon]);

  return (
    <>
      <Divider style={{ margin: "12px 0 20px 0" }} />

      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={initialValues}>
        {/* Vista previa */}
        <div
          style={{
            marginBottom: 24,
            padding: 20,
            borderRadius: 12,
            background: token.colorBgLayout,
            border: `1px solid ${token.colorBorder}`,
            textAlign: "center",
          }}
        >
          <Text
            type="secondary"
            style={{
              fontSize: 12,
              display: "block",
              marginBottom: 12,
            }}
          >
            Vista previa
          </Text>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: previewColor ?? PRESET_COLORS[0].value,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 16px ${previewColor ?? PRESET_COLORS[0].value}60`,
            }}
          >
            {previewIconElement}
          </div>
        </div>

        {/* Nombre de la categoría */}
        <Form.Item
          name="description"
          label="Nombre de la categoría"
          rules={[
            {
              required: true,
              message: "Ingresá el nombre de la categoría",
            },
          ]}
        >
          <Input
            style={{
              borderRadius: 8,
              height: 40,
            }}
            placeholder="Ej: Hogar, Transporte, etc."
          />
        </Form.Item>

        {/* Selector de color */}
        <Form.Item name="iconColor" label=" ">
          <ColorPicker
            value={previewColor}
            onChange={(color) => {
              form.setFieldValue("iconColor", color);
            }}
          />
        </Form.Item>

        {/* Selector de ícono */}
        <Form.Item name="iconName" label=" ">
          <IconPicker
            value={previewIcon}
            onChange={(iconName) => {
              form.setFieldValue("iconName", iconName);
            }}
            selectedColor={previewColor}
          />
        </Form.Item>

        {/* Botones */}
        <Flex gap={8} justify="flex-end" style={{ marginTop: 24 }}>
          <Button onClick={handleCancel} disabled={updateCategoryMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={updateCategoryMutation.isPending}
          >
            Guardar cambios
          </Button>
        </Flex>
      </Form>
    </>
  );
}

export function CategoryEditModal({
  category,
  open,
  onClose,
}: CategoryEditModalProps) {
  return (
    <Modal
      title="Editar Categoría"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
      key={category?.id} // Force re-mount cuando cambia la categoría
    >
      {category && (
        <CategoryEditModalContent category={category} onClose={onClose} />
      )}
    </Modal>
  );
}
