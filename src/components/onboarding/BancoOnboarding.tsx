import PlusOutlined from "@ant-design/icons/PlusOutlined";
import BankOutlined from "@ant-design/icons/BankOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import StarFilled from "@ant-design/icons/StarFilled";
import StarOutlined from "@ant-design/icons/StarOutlined";
import {
  Button,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { useState } from "react";
import type { OnboardingBankEntry } from "../../apis/onboarding/OnBoarding";

const { Text } = Typography;

interface Props {
  initialValues: { banksToAdd?: OnboardingBankEntry[] };
  onNext: (values: { banksToAdd: OnboardingBankEntry[] }) => void;
  onPrev: () => void;
}

export default function BancoOnboarding({ initialValues, onNext, onPrev }: Props) {
  const { token } = theme.useToken();
  const [form] = Form.useForm<{ description: string }>();
  const [banks, setBanks] = useState<OnboardingBankEntry[]>(
    initialValues.banksToAdd ?? [],
  );

  const handleAdd = () => {
    form.validateFields().then(({ description }) => {
      const trimmed = description.trim().toUpperCase();
      if (!trimmed || banks.some((b) => b.description === trimmed)) return;
      // El primero que se agrega es default automáticamente
      setBanks((prev) => [
        ...prev,
        { description: trimmed, isDefault: prev.length === 0 },
      ]);
      form.resetFields();
    }).catch(() => {});
  };

  const handleRemove = (description: string) => {
    setBanks((prev) => {
      const filtered = prev.filter((b) => b.description !== description);
      // Si borramos el default y quedan bancos, el primero pasa a ser default
      const hadDefault = prev.find((b) => b.description === description)?.isDefault;
      if (hadDefault && filtered.length > 0) {
        return filtered.map((b, i) => ({ ...b, isDefault: i === 0 }));
      }
      return filtered;
    });
  };

  const handleSetDefault = (description: string) => {
    setBanks((prev) =>
      prev.map((b) => ({ ...b, isDefault: b.description === description })),
    );
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          Agregá los bancos que usás y elegí cuál es tu default.
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          El banco default se selecciona automáticamente al registrar ingresos.
        </Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleAdd}>
        <Row gutter={[12, 0]} align="middle">
          <Col flex="auto">
            <Form.Item
              name="description"
              style={{ margin: 0 }}
              rules={[
                { required: true, message: "Ingresá el nombre del banco" },
              ]}
            >
              <Input
                placeholder="Nombre del banco..."
                style={{ borderRadius: 10, height: 40 }}
              />
            </Form.Item>
          </Col>
          <Col>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              htmlType="submit"
              style={{ height: 40, borderRadius: 10, fontWeight: 600 }}
            >
              Agregar
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Lista de bancos agregados */}
      <div
        style={{
          minHeight: 80,
          padding: "12px 14px",
          borderRadius: 12,
          border: `1.5px dashed ${token.colorBorderSecondary}`,
          background: token.colorFillAlter,
        }}
      >
        {banks.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                No agregaste bancos aún. Podés continuar sin agregar.
              </Text>
            }
            style={{ margin: "8px 0" }}
          />
        ) : (
          <Flex vertical gap={8}>
            {banks.map((bank) => (
              <div
                key={bank.description}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: `1.5px solid ${bank.isDefault ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
                  background: bank.isDefault ? token.colorPrimaryBg : token.colorBgContainer,
                  transition: "all 0.2s ease",
                }}
              >
                <Flex align="center" gap={10}>
                  <BankOutlined
                    style={{
                      color: bank.isDefault ? token.colorPrimary : token.colorTextSecondary,
                      fontSize: 16,
                    }}
                  />
                  <Text strong style={{ fontSize: 14 }}>
                    {bank.description.charAt(0) + bank.description.slice(1).toLowerCase()}
                  </Text>
                  {bank.isDefault && (
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
                <Flex gap={4}>
                  <Tooltip
                    title={bank.isDefault ? "Ya es el banco por defecto" : "Establecer como default"}
                  >
                    <Button
                      type="text"
                      size="small"
                      aria-label={`Estrella banco ${bank.description}`}
                      disabled={bank.isDefault}
                      onClick={() => handleSetDefault(bank.description)}
                      icon={
                        bank.isDefault
                          ? <StarFilled style={{ color: token.colorWarning }} />
                          : <StarOutlined style={{ color: token.colorTextQuaternary }} />
                      }
                    />
                  </Tooltip>
                  <Tooltip title="Eliminar banco">
                    <Button
                      type="text"
                      size="small"
                      danger
                      aria-label={`Eliminar banco ${bank.description}`}
                      onClick={() => handleRemove(bank.description)}
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Flex>
              </div>
            ))}
          </Flex>
        )}
      </div>

      <Text
        type="secondary"
        style={{ fontSize: 12, display: "block", textAlign: "center" }}
      >
        Podés agregar más bancos desde Configuración en cualquier momento.
      </Text>

      <Row gutter={[16, 10]}>
        <Col xs={12}>
          <Button block type="default" onClick={onPrev}>
            Volver
          </Button>
        </Col>
        <Col xs={12}>
          <Button
            block
            color="geekblue"
            variant="filled"
            onClick={() => onNext({ banksToAdd: banks })}
          >
            Siguiente
          </Button>
        </Col>
      </Row>
    </Space>
  );
}
