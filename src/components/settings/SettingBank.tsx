import {
  BankOutlined,
  DeleteOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
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
import { useAddBank, useBanks, useDeleteBank } from "../../apis/hooks/useBank";
import { useUserDefault, useSetUserDefault } from "../../apis/hooks/useSettings";
import type { BankRecord } from "../../models/Bank";
import { useCurrentUser } from "../../apis/hooks/useCurrentUser";
import { getEntityLabels } from "../utils/entityLabels";

const { Title, Text } = Typography;

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
  bancosQuitar: string;
}

function BankCard({
  bank,
  defaultBankId,
  onSetDefault,
  isSettingDefault,
  onDelete,
  isDeleting,
  bancosQuitar,
}: BankCardProps) {
  const { token } = theme.useToken();
  const isDefault = bank.id === defaultBankId;

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
              background: isDefault
                ? `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`
                : `linear-gradient(135deg, ${token.colorFill} 0%, ${token.colorFillSecondary} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isDefault
                ? `0 4px 14px ${token.colorPrimaryBorder}`
                : "0 2px 6px rgba(0,0,0,0.08)",
              flexShrink: 0,
              transition: "all 0.25s ease",
            }}
          >
            <BankOutlined style={{ color: "#fff", fontSize: 20 }} />
          </div>
          <Flex vertical gap={3}>
            <Flex align="center" gap={8}>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: token.colorText,
                  letterSpacing: "-0.2px",
                  lineHeight: 1,
                }}
              >
                {bank.description}
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
          <Tooltip
            title={
              isDefault
                ? "Ya es el banco por defecto"
                : "Establecer como banco por defecto"
            }
          >
            <Button
              type="text"
              aria-label={`Estrella banco ${bank.description}`}
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
              onClick={() => onSetDefault(bank.id)}
              icon={
                isDefault ? (
                  <StarFilled style={{ color: token.colorWarning, fontSize: 18 }} />
                ) : (
                  <StarOutlined style={{ color: token.colorTextQuaternary, fontSize: 18 }} />
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
              description={bancosQuitar}
              onConfirm={() => onDelete(bank.id)}
              okText="Eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
              disabled={isDefault}
            >
              <Button
                type="text"
                danger
                aria-label={`Eliminar banco ${bank.description}`}
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

export function SettingBank() {
  const { data: banks = [], isLoading } = useBanks();
  const { data: defaultBank } = useUserDefault("DEFAULT_BANK");
  const setDefaultMutation = useSetUserDefault();
  const addBankMutation = useAddBank();
  const deleteBankMutation = useDeleteBank();
  const [form] = Form.useForm<AddBankForm>();
  const { token } = theme.useToken();
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null);

  const onFinish = (values: AddBankForm) => {
    addBankMutation.mutate(values.description, {
      onSuccess: () => form.resetFields(),
    });
  };

  return (
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
          <BankOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Mis Bancos
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {labels.bancosSubtitle}
          </Text>
        </div>
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      {/* Agregar banco */}
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
                  style={{ borderRadius: 10, height: 40, fontSize: 14 }}
                  placeholder="Nombre del banco..."
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
                loading={addBankMutation.isPending}
              >
                Agregar
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Lista de bancos */}
      <Flex vertical gap={10}>
        {banks.map((bank: BankRecord, index: number) => (
          <div
            key={bank.id}
            className="step-enter-right"
            style={{ animationDelay: `${Math.min(index, 7) * 55}ms` }}
          >
            <BankCard
              bank={bank}
              defaultBankId={defaultBank?.value}
              onSetDefault={(id) =>
                setDefaultMutation.mutate({ key: "DEFAULT_BANK", value: id })
              }
              isSettingDefault={setDefaultMutation.isPending}
              onDelete={(id) => deleteBankMutation.mutate(id)}
              isDeleting={deleteBankMutation.isPending}
              bancosQuitar={labels.bancosQuitar}
            />
          </div>
        ))}
      </Flex>
    </Card>
  );
}
