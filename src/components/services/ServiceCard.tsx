import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Select,
  Tag,
  theme,
  Tooltip,
  Typography,
} from "antd";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import ApartmentOutlined from "@ant-design/icons/ApartmentOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import type { Service, ServiceToUpdate } from "../../models/Service";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { deleteSubscriptionApi } from "../../apis/SubscriptionApi";
import dayjs from "dayjs";
import { useWorkspaces } from "../../apis/hooks/useWorkspaces";
import type { Membership } from "../../models/UserWorkspace";

const { Text, Title } = Typography;

interface ServiceCardProps extends React.HTMLAttributes<HTMLElement> {
  service: Service;
  handlePayServiceMutation: (service: Service) => Promise<void> | void;
  handleUpdateServiceMutation: (
    serviceToUpdate: ServiceToUpdate,
  ) => Promise<void> | void;
}

interface ServiceFormUpdate {
  amount: number;
  lastPayment: dayjs.Dayjs | null;
  workspace: string;
  description: string;
}

export const ServiceCard = React.memo(function ServiceCard({
  service,
  handlePayServiceMutation,
  handleUpdateServiceMutation,
}: ServiceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm<ServiceFormUpdate>();
  const { data: userGroups = [] } = useWorkspaces();
  const { token } = theme.useToken();

  const isPaid = service.isPaid;
  const statusColor = isPaid ? token.colorSuccess : token.colorError;
  const statusBg = isPaid ? token.colorSuccessBg : token.colorErrorBg;
  const statusBorder = isPaid
    ? token.colorSuccessBorder
    : token.colorErrorBorder;

  const handleSaveAmount = () => {
    form
      .validateFields()
      .then((values) => {
        if (values.amount <= 0) {
          void message.warning("El monto debe ser mayor que 0");
          return;
        }
        handleUpdateServiceMutation({
          id: service.id,
          changes: {
            amount: values.amount,
            description: values.description,
            lastPayment: values.lastPayment
              ? dayjs(values.lastPayment).toDate()
              : null,
            workspace: values.workspace,
          },
        });
        setIsEditing(false);
      })
      .catch(() => {});
  };

  const handlePay = () => {
    setIsEditing(false);
    handlePayServiceMutation(service);
  };

  const handleCancelEdit = () => {
    form.resetFields();
    setIsEditing(false);
  };

  const deleteServiceMutation = useMutation({
    mutationFn: () => deleteSubscriptionApi(service),
    onError: (err) => console.error("Error eliminando el servicio:", err),
    onSuccess: () => console.debug("✅ Servicio eliminado correctamente"),
  });

  return (
    <Card
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: statusBorder,
        borderWidth: 2,
        background: statusBg,
      }}
      styles={{ body: { padding: 16 } }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          description: service.description,
          amount: service.amount,
          workspace: service.workspaceName,
          lastPayment: service.lastPayment
            ? dayjs(service.lastPayment)
            : dayjs(),
        }}
      >
        <div key={isEditing ? "edit" : "view"} className="fade-in">
        {/* Header */}
        <Flex align="center" justify="space-between" gap={8}>
          <Flex align="center" gap={10} style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: token.borderRadius,
                background: isPaid
                  ? token.colorSuccessBgHover
                  : token.colorErrorBgHover,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ApartmentOutlined style={{ color: statusColor, fontSize: 18 }} />
            </div>
            {isEditing ? (
              <Form.Item
                name="description"
                style={{ margin: 0, flex: 1 }}
                rules={[
                  { required: true, message: "La descripción es obligatoria" },
                ]}
              >
                <Input />
              </Form.Item>
            ) : (
              <Title
                level={5}
                style={{
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {service.description}
              </Title>
            )}
          </Flex>
          <Tag
            icon={isPaid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={isPaid ? "success" : "error"}
            style={{ borderRadius: 16, fontWeight: 600, flexShrink: 0 }}
          >
            {isPaid ? "Pagado" : "Pendiente"}
          </Tag>
        </Flex>

        <Divider style={{ margin: "12px 0" }} />

        {/* Monto */}
        <Flex align="center" justify="space-between" gap={8}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
              Monto
            </Text>
            {isEditing ? (
              <Form.Item
                name="amount"
                style={{ margin: 0 }}
                rules={[{ required: true, message: "El monto es obligatorio" }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  controls={false}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            ) : (
              <Title level={3} style={{ margin: 0, color: statusColor }}>
                {service.amount.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}{" "}
                <Text style={{ fontSize: 14, color: token.colorTextSecondary }}>
                  {service.currency?.symbol}
                </Text>
              </Title>
            )}
          </div>

          {/* Action buttons */}
          {!isEditing && (
            <Flex gap={4}>
              <Tooltip title="Editar">
                <Button
                  type="text"
                  icon={<EditOutlined style={{ fontSize: 18 }} />}
                  onClick={() => setIsEditing(true)}
                />
              </Tooltip>
              <Popconfirm
                title="¿Eliminar el servicio?"
                description="Esta acción no se puede deshacer."
                onConfirm={() => deleteServiceMutation.mutate()}
                okText="Sí"
                cancelText="No"
                placement="topRight"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                />
              </Popconfirm>
            </Flex>
          )}
        </Flex>

        {/* Grupo + usuario / edit grupo */}
        <div style={{ marginTop: 8 }}>
          {isEditing ? (
            <Form.Item
              name="workspace"
              label="Grupo"
              rules={[{ required: true, message: "Seleccione un grupo" }]}
              style={{ marginBottom: 8 }}
            >
              <Select
                placeholder="Seleccionar grupo"
                options={userGroups.map((group: Membership) => ({
                  label: group.workspaceName,
                  value: group.workspaceName,
                  key: group.workspaceId,
                }))}
              />
            </Form.Item>
          ) : (
            <Flex gap={6} wrap="wrap" style={{ marginTop: 4 }}>
              <Tag color={isPaid ? "green" : "red"} variant="solid">
                {service.workspaceName}
              </Tag>
              <Tag color={isPaid ? "green" : "red"} variant="solid">
                {service.user}
              </Tag>
            </Flex>
          )}
        </div>

        {/* Último pago */}
        <div style={{ marginTop: 8 }}>
          {isEditing ? (
            <Form.Item
              name="lastPayment"
              label="Último pago"
              style={{ marginBottom: 8 }}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          ) : (
            <Text style={{ fontSize: 13 }}>
              <Text strong>Último pago: </Text>
              <Text type="secondary">
                {service.lastPayment?.toString() ?? "—"}
              </Text>
            </Text>
          )}
        </div>

        {/* Footer buttons */}
        {isEditing && (
          <>
            <Divider style={{ margin: "12px 0" }} />
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={12}>
                <Button
                  block
                  icon={<CheckOutlined />}
                  color="blue"
                  variant="outlined"
                  onClick={handleSaveAmount}
                >
                  Guardar
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button
                  block
                  icon={<CloseOutlined />}
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </Button>
              </Col>
            </Row>
          </>
        )}
        {!isPaid && !isEditing && (
          <>
            <Divider style={{ margin: "12px 0" }} />
            <Button
              block
              variant="outlined"
              icon={<CheckCircleOutlined />}
              style={{ borderColor: statusColor, color: statusColor }}
              onClick={handlePay}
            >
              Marcar como pagado
            </Button>
          </>
        )}
        </div>
      </Form>
    </Card>
  );
});
