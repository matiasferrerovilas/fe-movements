import {
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
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
import type { Service, ServiceToUpdate } from "@/models/Service";
import React, { useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useDeleteService } from "@/apis/hooks/useService";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { getServiceLabels } from "@/utils/serviceLabels";
import { useUndoableDelete } from "@/utils/useUndoableDelete";
import { getWorkspaceDisplayName } from "@/utils/workspaceDisplay";
import PendingDeleteIndicator from "@/components/PendingDeleteIndicator";

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
  description: string;
}

export const ServiceCard = React.memo(function ServiceCard({
  service,
  handlePayServiceMutation,
  handleUpdateServiceMutation,
}: ServiceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm<ServiceFormUpdate>();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const { data: currentUser } = useCurrentUser();
  const { t } = useTranslation();
  const labels = getServiceLabels(currentUser?.userType ?? null, t);

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
          void message.warning(t("services.card.amountMustBePositive"));
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

  const deleteServiceMutation = useDeleteService();
  const { requestDelete: requestDeleteService, isPending: isPendingServiceRemoval } =
    useUndoableDelete<Service>({
      getId: (s) => s.id,
      onDelete: (s) => deleteServiceMutation.mutateAsync(s),
      getMessage: () => t("services.card.undoDeletedMessage", { description: service.description }),
    });
  const isPendingRemoval = isPendingServiceRemoval(service);

  return (
    <Card
      style={{
        position: "relative",
        borderRadius: token.borderRadiusLG,
        borderColor: statusBorder,
        borderWidth: 2,
        background: statusBg,
        ...(isPendingRemoval
          ? { opacity: 0.45, filter: "grayscale(70%)", pointerEvents: "none" }
          : {}),
      }}
      styles={{ body: { padding: 16 } }}
    >
      {isPendingRemoval && <PendingDeleteIndicator />}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          description: service.description,
          amount: service.amount,
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
                  {
                    required: true,
                    message: t("services.card.descriptionRequired"),
                  },
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
            {isPaid ? t("services.card.statusPaid") : t("services.card.statusPending")}
          </Tag>
        </Flex>

        <Divider style={{ margin: "12px 0" }} />

        {/* Monto */}
        <Flex align="center" justify="space-between" gap={8}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
              {t("services.card.amountLabel")}
            </Text>
            {isEditing ? (
              <Form.Item
                name="amount"
                style={{ margin: 0 }}
                rules={[
                  { required: true, message: t("services.card.amountRequired") },
                ]}
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
              <Tooltip title={t("services.card.editTooltip")}>
                <Button
                  type="text"
                  icon={<EditOutlined style={{ fontSize: 18 }} />}
                  onClick={() => setIsEditing(true)}
                  aria-label={t("services.card.editAriaLabel", {
                    description: service.description,
                  })}
                />
              </Tooltip>
              <Popconfirm
                title={labels.eliminar}
                description={t("services.card.deleteConfirmDescription")}
                onConfirm={() => requestDeleteService(service)}
                okText={t("services.card.yes")}
                cancelText={t("services.card.no")}
                placement="topRight"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                  aria-label={t("services.card.deleteAriaLabel", {
                    description: service.description,
                  })}
                />
              </Popconfirm>
            </Flex>
          )}
        </Flex>

        {/* Grupo + usuario */}
        <div style={{ marginTop: 8 }}>
          <Flex gap={6} wrap="wrap" style={{ marginTop: 4 }}>
            <Tag color={isPaid ? "green" : "red"} variant="solid">
              {getWorkspaceDisplayName(service.workspaceName, t)}
            </Tag>
            <Tag color={isPaid ? "green" : "red"} variant="solid">
              {service.user}
            </Tag>
          </Flex>
        </div>

        {/* Último pago */}
        <div style={{ marginTop: 8 }}>
          {isEditing ? (
            <Form.Item
              name="lastPayment"
              label={t("services.card.lastPaymentLabel")}
              style={{ marginBottom: 8 }}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          ) : (
            <Text style={{ fontSize: 13 }}>
              <Text strong>{t("services.card.lastPaymentPrefix")} </Text>
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
                  {t("services.card.saveButton")}
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button
                  block
                  icon={<CloseOutlined />}
                  onClick={handleCancelEdit}
                >
                  {t("services.card.cancelButton")}
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
              {t("services.card.markAsPaidButton")}
            </Button>
          </>
        )}
        </div>
      </Form>
    </Card>
  );
});
