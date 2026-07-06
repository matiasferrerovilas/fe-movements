import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import LineChartOutlined from "@ant-design/icons/LineChartOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import StarFilled from "@ant-design/icons/StarFilled";
import StarOutlined from "@ant-design/icons/StarOutlined";
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
import React, { useMemo, useState } from "react";
import {
  useAddInvestmentType,
  useDeleteInvestmentType,
  useInvestmentTypes,
} from "@/apis/hooks/useInvestmentTypes";
import { useUserDefault, useSetUserDefault } from "@/apis/hooks/useSettings";
import type { InvestmentType } from "@/models/InvestmentType";
import { InvestmentTypeEditModal } from "@/components/settings/InvestmentTypeEditModal";
import { getIconComponent } from "@/utils/getIconComponent";
import { PRESET_COLORS } from "@/components/settings/ColorPicker";

const { Title, Text } = Typography;

interface AddTypeForm {
  name: string;
}

interface InvestmentTypeCardProps {
  investmentType: InvestmentType;
  defaultTypeId?: number | null;
  onSetDefault: (id: number) => void;
  isSettingDefault?: boolean;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  onEdit: (investmentType: InvestmentType) => void;
}

function InvestmentTypeCard({
  investmentType,
  defaultTypeId,
  onSetDefault,
  isSettingDefault,
  onDelete,
  isDeleting,
  onEdit,
}: InvestmentTypeCardProps) {
  const { token } = theme.useToken();
  const isDefault = investmentType.id === defaultTypeId;

  const iconColor = investmentType.iconColor ?? token.colorPrimary;

  const iconElement = useMemo(() => {
    const IconComponent = getIconComponent(investmentType.iconName ?? "LineChartOutlined");
    return React.createElement(IconComponent, { style: { color: "#fff", fontSize: 20 } });
  }, [investmentType.iconName]);

  return (
    <Card
      hoverable
      styles={{ body: { padding: "14px 18px", cursor: "default" } }}
      style={{
        borderRadius: 16,
        border: `1.5px solid ${isDefault ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
        background: isDefault ? token.colorPrimaryBg : token.colorFillAlter,
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
              background: `linear-gradient(135deg, ${iconColor} 0%, ${iconColor}dd 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 14px ${iconColor}60`,
              flexShrink: 0,
              transition: "all 0.25s ease",
            }}
          >
            {iconElement}
          </div>
          <Flex vertical gap={3}>
            <Flex align="center" gap={8}>
              <Text
                strong
                style={{ fontSize: 15, color: token.colorText, letterSpacing: "-0.2px", lineHeight: 1 }}
              >
                {investmentType.name}
              </Text>
              {isDefault && (
                <span
                  style={{
                    background: `linear-gradient(90deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
                    borderRadius: 20,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    padding: "2px 9px",
                    textTransform: "uppercase",
                    lineHeight: "18px",
                  }}
                >
                  ★ Default
                </span>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Space size={4}>
          <Tooltip title={isDefault ? "Ya es el tipo por defecto" : "Establecer como tipo por defecto"}>
            <Button
              type="text"
              aria-label={`Estrella tipo ${investmentType.name}`}
              style={{
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              disabled={isDefault || isSettingDefault}
              onClick={() => onSetDefault(investmentType.id)}
              icon={
                isDefault ? (
                  <StarFilled style={{ color: token.colorWarning, fontSize: 18 }} />
                ) : (
                  <StarOutlined style={{ color: token.colorTextQuaternary, fontSize: 18 }} />
                )
              }
            />
          </Tooltip>
          <Tooltip title="Editar tipo de inversión">
            <Button
              type="text"
              aria-label={`Editar tipo ${investmentType.name}`}
              onClick={() => onEdit(investmentType)}
              style={{
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              icon={<EditOutlined style={{ fontSize: 16 }} />}
            />
          </Tooltip>
          <Tooltip
            title={isDefault ? "No se puede eliminar el tipo por defecto" : "Eliminar tipo de inversión"}
          >
            <Popconfirm
              title="¿Eliminar este tipo de inversión?"
              description="Se quitará de tu lista de tipos."
              onConfirm={() => onDelete(investmentType.id)}
              okText="Eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
              disabled={isDefault}
            >
              <Button
                type="text"
                danger
                aria-label={`Eliminar tipo ${investmentType.name}`}
                style={{
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                disabled={isDefault || isDeleting}
                icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      </Flex>
    </Card>
  );
}

export function SettingInvestmentType() {
  const { data: investmentTypes = [], isLoading } = useInvestmentTypes();
  const { data: defaultType } = useUserDefault("DEFAULT_INVESTMENT_TYPE");
  const setDefaultMutation = useSetUserDefault();
  const addMutation = useAddInvestmentType();
  const deleteMutation = useDeleteInvestmentType();
  const [form] = Form.useForm<AddTypeForm>();
  const { token } = theme.useToken();

  const [editingType, setEditingType] = useState<InvestmentType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const onFinish = (values: AddTypeForm) => {
    addMutation.mutate(
      { name: values.name, iconName: "LineChartOutlined", iconColor: PRESET_COLORS[8].value },
      { onSuccess: () => form.resetFields() },
    );
  };

  const handleEdit = (investmentType: InvestmentType) => {
    setEditingType(investmentType);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingType(null);
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
            <LineChartOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Tipos de Inversión
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Administrá los tipos de inversión disponibles en tu workspace.
            </Text>
          </div>
        </Flex>

        <Divider style={{ margin: "14px 0" }} />

        {/* Agregar tipo */}
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
            style={{ fontSize: 13, color: token.colorText, display: "block", marginBottom: 10 }}
          >
            Nuevo Tipo
          </Text>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={[12, 0]} align="middle">
              <Col xs={24} sm={16} md={18}>
                <Form.Item
                  name="name"
                  style={{ margin: 0 }}
                  rules={[{ required: true, message: "Ingresá el nombre del tipo de inversión" }]}
                >
                  <Input
                    style={{ borderRadius: 10, height: 40, fontSize: 14 }}
                    placeholder="Ej: Acciones, FCI, Cripto, Plazo Fijo..."
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
                  loading={addMutation.isPending}
                >
                  Agregar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Lista */}
        <Flex vertical gap={10}>
          {investmentTypes.map((type: InvestmentType, index: number) => (
            <div
              key={type.id}
              className="step-enter-right"
              style={{ animationDelay: `${Math.min(index, 7) * 55}ms` }}
            >
              <InvestmentTypeCard
                investmentType={type}
                defaultTypeId={defaultType?.value}
                onSetDefault={(id) =>
                  setDefaultMutation.mutate({ key: "DEFAULT_INVESTMENT_TYPE", value: id })
                }
                isSettingDefault={setDefaultMutation.isPending}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDeleting={deleteMutation.isPending}
                onEdit={handleEdit}
              />
            </div>
          ))}
        </Flex>
      </Card>

      <InvestmentTypeEditModal
        investmentType={editingType}
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
      />
    </>
  );
}
