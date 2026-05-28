import { Button, Divider, Flex, Form, Input, message, Modal, theme, Typography } from "antd";
import React, { useMemo } from "react";
import type { InvestmentType } from "../../models/InvestmentType";
import { useUpdateInvestmentType } from "../../apis/hooks/useInvestmentTypes";
import { ColorPicker, PRESET_COLORS } from "./ColorPicker";
import { IconPicker } from "./IconPicker";
import { getIconComponent } from "../../utils/getIconComponent";

const { Text } = Typography;

interface InvestmentTypeEditModalProps {
  investmentType: InvestmentType | null;
  open: boolean;
  onClose: () => void;
}

interface InvestmentTypeEditForm {
  name: string;
  iconName: string;
  iconColor: string;
}

function InvestmentTypeEditModalContent({
  investmentType,
  onClose,
}: {
  investmentType: InvestmentType;
  onClose: () => void;
}) {
  const { token } = theme.useToken();
  const updateMutation = useUpdateInvestmentType();

  const initialValues = useMemo(
    () => ({
      name: investmentType.name,
      iconName: investmentType.iconName ?? "QuestionOutlined",
      iconColor: investmentType.iconColor ?? PRESET_COLORS[0].value,
    }),
    [investmentType.name, investmentType.iconName, investmentType.iconColor],
  );

  const [form] = Form.useForm<InvestmentTypeEditForm>();
  const formValues = Form.useWatch([], form);
  const previewIcon = formValues?.iconName ?? initialValues.iconName;
  const previewColor = formValues?.iconColor ?? initialValues.iconColor;

  const handleSubmit = async (values: InvestmentTypeEditForm) => {
    try {
      await updateMutation.mutateAsync({
        id: investmentType.id,
        payload: {
          name: values.name,
          iconName: values.iconName,
          iconColor: values.iconColor,
        },
      });
      message.success("Tipo de inversión actualizado");
      onClose();
    } catch (error) {
      message.error("Error al actualizar el tipo de inversión");
      console.error(error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const previewIconElement = useMemo(() => {
    const IconComponent = getIconComponent(previewIcon);
    return React.createElement(IconComponent, { style: { fontSize: 32, color: "#fff" } });
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
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
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

        <Form.Item
          name="name"
          label="Nombre del tipo"
          rules={[{ required: true, message: "Ingresá el nombre del tipo de inversión" }]}
        >
          <Input style={{ borderRadius: 8, height: 40 }} placeholder="Ej: Acciones, FCI, Cripto..." />
        </Form.Item>

        <Form.Item name="iconColor" label=" ">
          <ColorPicker
            value={previewColor}
            onChange={(color) => form.setFieldValue("iconColor", color)}
          />
        </Form.Item>

        <Form.Item name="iconName" label=" ">
          <IconPicker
            value={previewIcon}
            onChange={(iconName) => form.setFieldValue("iconName", iconName)}
            selectedColor={previewColor}
          />
        </Form.Item>

        <Flex gap={8} justify="flex-end" style={{ marginTop: 24 }}>
          <Button onClick={handleCancel} disabled={updateMutation.isPending}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
            Guardar cambios
          </Button>
        </Flex>
      </Form>
    </>
  );
}

export function InvestmentTypeEditModal({
  investmentType,
  open,
  onClose,
}: InvestmentTypeEditModalProps) {
  return (
    <Modal
      title="Editar Tipo de Inversión"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
      key={investmentType?.id}
    >
      {investmentType && (
        <InvestmentTypeEditModalContent investmentType={investmentType} onClose={onClose} />
      )}
    </Modal>
  );
}
