import {
  BankOutlined,
  DeleteOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Popconfirm, Row, Space, Tooltip, Typography } from "antd";
import { useAddBank, useBanks, useDeleteBank } from "../../apis/hooks/useBank";
import { useUserDefault, useSetUserDefault } from "../../apis/hooks/useSettings";
import type { BankRecord } from "../../models/Bank";

const { Title, Text } = Typography;

const css = `
  .bank-card {
    border-radius: 16px !important;
    transition: all 0.25s ease !important;
    overflow: hidden;
  }
  .bank-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.09) !important;
  }
  .bank-card-default {
    background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%) !important;
    border: 1.5px solid #91b4f5 !important;
  }
  .bank-card-normal {
    background: #f7f8fa !important;
    border: 1.5px solid #e8eaed !important;
  }
  .bank-star-btn {
    border-radius: 50% !important;
    width: 34px !important;
    height: 34px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    transition: all 0.2s ease !important;
  }
  .bank-star-btn:not(:disabled):hover {
    background: #fff8e1 !important;
    transform: scale(1.18);
  }
  .bank-delete-btn {
    border-radius: 50% !important;
    width: 34px !important;
    height: 34px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    transition: all 0.2s ease !important;
  }
  .bank-delete-btn:not(:disabled):hover {
    background: #fff1f0 !important;
    transform: scale(1.18);
  }
  .create-bank-card {
    border-radius: 14px !important;
    border: 1.5px dashed #b6c8e8 !important;
    background: linear-gradient(135deg, #f8faff 0%, #eef3fb 100%) !important;
    margin-bottom: 20px;
  }
  .create-bank-input {
    background: #fff !important;
    border: 1.5px solid #e0eaff !important;
    border-radius: 10px !important;
    height: 40px !important;
    font-size: 14px !important;
    transition: border-color 0.2s !important;
  }
  .create-bank-input:focus, .create-bank-input:hover {
    border-color: #4f9cf7 !important;
  }
  .create-bank-btn {
    height: 40px !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    background: linear-gradient(90deg, #1a6fd4, #4f9cf7) !important;
    border: none !important;
    color: #fff !important;
    box-shadow: 0 2px 10px rgba(26, 111, 212, 0.25) !important;
    transition: all 0.2s ease !important;
  }
  .create-bank-btn:hover {
    opacity: 0.88 !important;
    transform: translateY(-1px) !important;
  }
`;

interface AddBankForm {
  description: string;
}

interface BankCardProps {
  bank: BankRecord;
  defaultBankId?: number | null;
  onSetDefault: (id: number) => void;
  isSettingDefault?: boolean;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

function BankCard({
  bank,
  defaultBankId,
  onSetDefault,
  isSettingDefault,
  onDelete,
  isDeleting,
}: BankCardProps) {
  const isDefault = bank.id === defaultBankId;

  return (
    <Card
      hoverable
      className={`bank-card ${isDefault ? "bank-card-default" : "bank-card-normal"}`}
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
              background: isDefault
                ? "linear-gradient(135deg, #1a6fd4 0%, #4f9cf7 100%)"
                : "linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isDefault
                ? "0 4px 14px rgba(26, 111, 212, 0.32)"
                : "0 2px 6px rgba(0,0,0,0.08)",
              flexShrink: 0,
              transition: "all 0.25s ease",
            }}
          >
            <BankOutlined style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: isDefault ? "#1a3a6b" : "#1f2937",
                  letterSpacing: "-0.2px",
                  lineHeight: 1,
                }}
              >
                {bank.description}
              </Text>
              {isDefault && (
                <span
                  style={{
                    background: "linear-gradient(90deg, #1a6fd4, #4f9cf7)",
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
            </div>
          </div>
        </div>
        <Space size={4}>
          <Tooltip
            title={
              isDefault
                ? "Ya es el banco por defecto"
                : "Establecer como banco por defecto"
            }
          >
            <Button
              type="text"
              className="bank-star-btn"
              disabled={isDefault || isSettingDefault}
              onClick={() => onSetDefault(bank.id)}
              icon={
                isDefault ? (
                  <StarFilled style={{ color: "#f5a623", fontSize: 18 }} />
                ) : (
                  <StarOutlined style={{ color: "#c4c9d4", fontSize: 18 }} />
                )
              }
            />
          </Tooltip>
          <Tooltip
            title={
              isDefault
                ? "No se puede eliminar el banco por defecto"
                : "Eliminar banco"
            }
          >
            <Popconfirm
              title="¿Eliminar este banco?"
              description="Se quitará de tu lista personal."
              onConfirm={() => onDelete(bank.id)}
              okText="Eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
              disabled={isDefault}
            >
              <Button
                type="text"
                danger
                className="bank-delete-btn"
                disabled={isDefault || isDeleting}
                icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      </div>
    </Card>
  );
}

export function SettingBank() {
  const { data: banks = [], isLoading } = useBanks();
  const { data: defaultBank } = useUserDefault("DEFAULT_BANK");
  const setDefaultMutation = useSetUserDefault();
  const addBankMutation = useAddBank();
  const deleteBankMutation = useDeleteBank();
  const [form] = Form.useForm<AddBankForm>();

  const onFinish = (values: AddBankForm) => {
    addBankMutation.mutate(values.description, {
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
              background: "linear-gradient(135deg, #1a6fd4, #4f9cf7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 10px rgba(26,111,212,0.25)",
            }}
          >
            <BankOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, color: "#1a3a6b" }}>
              Mis Bancos
            </Title>
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              Agregá y gestioná los bancos en tu lista personal.
            </Text>
          </div>
        </div>

        <div style={{ height: 1, background: "#f0f4ff", margin: "14px 0" }} />

        {/* Agregar banco */}
        <Card
          className="create-bank-card"
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
            Nuevo Banco
          </Text>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={[12, 0]} align="middle">
              <Col xs={24} sm={16} md={18}>
                <Form.Item
                  name="description"
                  style={{ margin: 0 }}
                  rules={[
                    { required: true, message: "Ingresá el nombre del banco" },
                  ]}
                >
                  <Input
                    className="create-bank-input"
                    placeholder="Nombre del banco..."
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Button
                  icon={<PlusOutlined />}
                  block
                  htmlType="submit"
                  className="create-bank-btn"
                  loading={addBankMutation.isPending}
                >
                  Agregar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Lista de bancos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {banks.map((bank: BankRecord) => (
            <BankCard
              key={bank.id}
              bank={bank}
              defaultBankId={defaultBank?.value}
              onSetDefault={(id) =>
                setDefaultMutation.mutate({ key: "DEFAULT_BANK", value: id })
              }
              isSettingDefault={setDefaultMutation.isPending}
              onDelete={(id) => deleteBankMutation.mutate(id)}
              isDeleting={deleteBankMutation.isPending}
            />
          ))}
        </div>
      </Card>
    </>
  );
}
