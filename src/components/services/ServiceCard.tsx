import {
  Card,
  Space,
  Typography,
  Tag,
  Button,
  Tooltip,
  Row,
  Col,
  InputNumber,
  message,
  Popconfirm,
  Form,
  Input,
  DatePicker,
  Select,
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
import { deleteServiceApi } from "../../apis/ServiceApi";
import { ColorEnum } from "../../enums/ColorEnum";
import dayjs from "dayjs";
import { useGroups } from "../../apis/hooks/useGroups";

const { Text, Title } = Typography;

interface ServiceCardProps extends React.HTMLAttributes<HTMLElement> {
  service: Service;

  handlePayServiceMutation: (service: Service) => Promise<void> | void;
  handleUpdateServiceMutation: (
    serviceToUpdate: ServiceToUpdate
  ) => Promise<void> | void;
}

interface ServiceFormUpdate {
  amount: number;
  lastPayment: Date | null;
  group: string;
  description: string;
}
export const ServiceCard = React.memo(function ServiceCard({
  service,
  handlePayServiceMutation,
  handleUpdateServiceMutation,
}: ServiceCardProps) {
  const status = service.isPaid ? "Pagado" : "Pendiente";

  const color = service.isPaid ? "#52c41a" : "#ff4d4f";
  const bgColor = service.isPaid ? "#f6ffed" : "#fff1f0";
  const [isEditing, setIsEditing] = useState(false);

  const [form] = Form.useForm<ServiceFormUpdate>();
  const { data: userGroups = [] } = useGroups();

  const icon = service.isPaid ? (
    <CheckCircleOutlined />
  ) : (
    <CloseCircleOutlined />
  );
  const handleSaveAmount = () => {
    /*if (newAmount <= 0) {
      message.warning("El monto debe ser mayor que 0");
      return;
    }
    const serviceToUpdate: ServiceToUpdate = {
      id: service.id,
      changes: {
        amount: newAmount,
      },
    };
    handleUpdateServiceMutation(serviceToUpdate);*/
    form
      .validateFields()
      .then((values) => {
        if (values.amount <= 0) {
          message.warning("El monto debe ser mayor que 0");
          return;
        }

        const serviceToUpdate: ServiceToUpdate = {
          id: service.id,
          changes: {
            amount: values.amount,
            description: values.description,
            lastPayment: values.lastPayment,
            group: values.group,
          },
        };
        handleUpdateServiceMutation(serviceToUpdate);
        setIsEditing(false);
        message.success("Servicio actualizado");
      })
      .catch(() => {});
    setIsEditing(false);
    message.success("Monto actualizado");
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
    mutationFn: () => deleteServiceApi(service),
    onError: (err) => {
      console.error("Error eliminando el servicio:", err);
    },
    onSuccess: () => {
      console.debug("✅ Has eliminado el servicio correctamente");
    },
  });
  return (
    <Card
      variant="outlined"
      style={{
        borderWidth: 2,
        borderRadius: 16,
        borderColor: service.isPaid
          ? ColorEnum.VERDE_PAGADO_BORDE
          : ColorEnum.ROJO_FALTA_PAGO_BORDE,
        background: service.isPaid
          ? ColorEnum.VERDE_PAGADO
          : ColorEnum.ROJO_FALTA_PAGO,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
      styles={{
        body: { padding: 20 },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          description: service.description,
          amount: service.amount,
          group: service.group,
          lastPayment: service.lastPayment
            ? dayjs(service.lastPayment)
            : dayjs(),
        }}
      >
        <Space
          orientation="horizontal"
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <Space align="center">
            <div
              style={{
                backgroundColor: bgColor,
                color,
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ApartmentOutlined />
            </div>
            {isEditing ? (
              <Form.Item
                name="description"
                style={{ margin: 0 }}
                rules={[
                  { required: true, message: "La descripción es obligatoria" },
                ]}
              >
                <Input />
              </Form.Item>
            ) : (
              <Title level={5} style={{ margin: 0 }}>
                {service.description}
              </Title>
            )}
          </Space>

          <Tag
            icon={icon}
            color={service.isPaid ? "success" : "error"}
            style={{
              borderRadius: 16,
              fontWeight: 500,
            }}
          >
            {status}
          </Tag>
        </Space>

        <Col style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Monto
          </Text>
          <Row>
            <Col flex="auto">
              {isEditing ? (
                <Form.Item
                  name="amount"
                  style={{ margin: 0 }}
                  rules={[
                    {
                      required: true,
                      message: "El monto es obligatorio",
                    },
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
                <Title level={3} style={{ margin: 0 }}>
                  {service.amount.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  {service.currency?.symbol}
                </Title>
              )}
            </Col>
            {!isEditing && (
              <Col>
                <Popconfirm
                  title="¿Estás seguro de que quieres eliminar el servicio?"
                  onConfirm={() => deleteServiceMutation.mutate()}
                  okText="Sí"
                  cancelText="No"
                  placement="topRight"
                >
                  <Button
                    type="text"
                    icon={
                      <DeleteOutlined
                        style={{ fontSize: 22, cursor: "pointer" }}
                      />
                    }
                    style={{
                      color: "gray",
                      borderRadius: 8,
                      padding: "4px 8px",
                      fontSize: 18,
                    }}
                    title="Eliminar el servicio"
                  />
                </Popconfirm>
              </Col>
            )}
            {!service.isPaid && (
              <Col>
                {!isEditing && (
                  <Tooltip title="Editar monto">
                    <Button
                      type="text"
                      size="middle"
                      icon={<EditOutlined style={{ fontSize: 20 }} />}
                      style={{
                        color: "gray",
                        borderRadius: 8,
                        padding: "0 8px",
                      }}
                      onClick={() => setIsEditing(true)}
                    />
                  </Tooltip>
                )}
              </Col>
            )}
          </Row>
        </Col>
        <Col style={{ marginTop: 4 }}>
          {isEditing ? (
            <>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Grupo
              </Text>
              <Form.Item
                name="group"
                rules={[{ required: true, message: "Seleccione un grupo" }]}
              >
                <Select placeholder="Seleccionar grupo">
                  {userGroups.map((group) => (
                    <Select.Option key={group.id} value={group.name}>
                      {group.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          ) : (
            <Row gutter={[4, 4]}>
              <Col>
                <Tag
                  style={{ marginTop: 10 }}
                  variant="solid"
                  color={service.isPaid ? "green" : "red"}
                >
                  {service.group}
                </Tag>
              </Col>
              <Col>
                <Tag
                  style={{ marginTop: 10 }}
                  variant="solid"
                  color={service.isPaid ? "green" : "red"}
                >
                  {service.user}
                </Tag>
              </Col>
            </Row>
          )}
        </Col>
        <Col style={{ marginTop: 16 }} span={24}>
          {isEditing ? (
            <>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Último pago
              </Text>
              <Form.Item name="lastPayment" style={{ margin: 0 }}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </>
          ) : (
            <Text>
              <Text strong>Último pago:</Text>
              {service.lastPayment?.toString()}
            </Text>
          )}
        </Col>

        {!service.isPaid &&
          (isEditing ? (
            <Col>
              <Button
                block
                icon={<CheckOutlined />}
                style={{
                  marginTop: 16,
                  borderRadius: 8,
                  borderColor: color,
                  color,
                }}
                onClick={handleSaveAmount}
              >
                Guardar
              </Button>
              <Button
                block
                style={{
                  marginTop: 16,
                  borderRadius: 8,
                  borderColor: color,
                  color,
                }}
                icon={<CloseOutlined />}
                onClick={handleCancelEdit}
              >
                {" "}
                Cancelar
              </Button>
            </Col>
          ) : (
            <Button
              block
              style={{
                marginTop: 16,
                borderRadius: 8,
                borderColor: color,
                color,
              }}
              onClick={handlePay}
            >
              {service.isPaid ? "Marcar como pendiente" : "Marcar como pagado"}
            </Button>
          ))}
      </Form>
    </Card>
  );
});
