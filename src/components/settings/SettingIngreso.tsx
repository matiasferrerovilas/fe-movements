import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Form,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Tag,
  theme,
  Typography,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useGroups } from "../../apis/hooks/useGroups";
import { useIncome } from "../../apis/hooks/useIncome";
import { useUserDefault } from "../../apis/hooks/useSettings";
import {
  DeleteOutlined,
  DollarOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  addIncome,
  deleteIncome,
  reloadIncome,
} from "../../apis/income/IncomeAPI";
import type { Income, IncomeAddForm } from "../../models/Income";
import { useCurrency } from "../../apis/hooks/useCurrency";
import { useBanks } from "../../apis/hooks/useBank";

const { Title, Text } = Typography;

export function SettingIngreso() {
  const [form] = Form.useForm<IncomeAddForm>();
  const { data: ingresos, isLoading } = useIncome();
  const { token } = theme.useToken();
  const { data: memberships = [] } = useGroups();
  const { data: currencies = [] } = useCurrency();
  const { data: banks = [] } = useBanks();
  const { data: defaultAccount } = useUserDefault("DEFAULT_ACCOUNT");
  const { data: defaultBank } = useUserDefault("DEFAULT_BANK");
  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");
  const queryClient = useQueryClient();

  const createIngresoMutation = useMutation({
    mutationFn: ({ income }: { income: IncomeAddForm }) => addIncome(income),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-all"] });
      form.resetFields();
    },
  });

  const deleteIngresoMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-all"] });
    },
  });

  const addIngresoMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => reloadIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-all"] });
    },
  });

  useEffect(() => {
    const bankDescription = banks.find(
      (b) => b.id === defaultBank?.value
    )?.description;
    const currencySymbol = currencies.find(
      (c) => c.id === defaultCurrency?.value
    )?.symbol;
    const groupDescription = memberships.find(
      (m) => m.groupId === defaultAccount?.value
    )?.groupDescription;
    form.setFieldsValue({
      bank: bankDescription,
      currency: currencySymbol,
      group: groupDescription,
    });
  }, [defaultAccount, defaultBank, defaultCurrency, banks, currencies, memberships]);

  const onFinish = (values: IncomeAddForm) => {    createIngresoMutation.mutate({ income: values });
    form.resetFields();
  };

  return (
    <Card loading={isLoading} style={{ borderRadius: token.borderRadiusLG }}>
      {/* Header */}
      <Flex align="center" gap={12} style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: token.borderRadius,
            background: token.colorPrimary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <DollarOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Gestionar Ingresos
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Configurá tu ingreso mensual por grupo. Se genera un movimiento
            automático cada mes.
          </Text>
        </div>
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      {/* Form card */}
      <Card
        size="small"
        style={{
          borderRadius: token.borderRadiusLG,
          background: token.colorFillAlter,
          borderColor: token.colorBorderSecondary,
          marginBottom: token.marginMD,
        }}
      >
        <Text strong style={{ display: "block", marginBottom: token.marginSM }}>
          Agregar Ingreso
        </Text>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={
            memberships && {
              group: memberships.find(
                (m) => m.groupId === defaultAccount?.value
              )?.groupDescription,
              bank: banks.find((b) => b.id === defaultBank?.value)?.description,
              currency: currencies.find((c) => c.id === defaultCurrency?.value)
                ?.symbol,
            }
          }
        >
          <Row gutter={[12, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="bank"
                label="Banco"
                rules={[{ required: true, message: "Seleccione un banco" }]}
              >
                <Select placeholder="Seleccionar banco">
                  {banks.map((bank) => (
                    <Select.Option key={bank.id} value={bank.description}>
                      {bank.description}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="group"
                label="Grupo"
                rules={[{ required: true, message: "Seleccione un grupo" }]}
              >
                <Select
                  placeholder="Seleccionar grupo"
                  options={memberships.map((membership) => ({
                    label: membership.groupDescription,
                    value: membership.groupDescription,
                    key: membership.groupId,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="currency"
                label="Moneda"
                rules={[{ required: true, message: "Ingrese Moneda" }]}
              >
                <Select placeholder="Seleccionar moneda">
                  {currencies.map((currency) => (
                    <Select.Option key={currency.id} value={currency.symbol}>
                      {currency.symbol}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="amount"
                label="Monto"
                rules={[{ required: true, message: "Ingresar Monto" }]}
              >
                <InputNumber
                  precision={2}
                  style={{ width: "100%" }}
                  controls={false}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            block
            htmlType="submit"
            loading={createIngresoMutation.isPending}
          >
            Agregar ingreso
          </Button>
        </Form>
      </Card>

      {/* Lista de ingresos */}
      {!ingresos || ingresos.length === 0 ? (
        <Empty description="Todavía no configuraste ingresos" />
      ) : (
        <Flex vertical gap={10}>
          {ingresos.map((ingreso: Income) => (
            <Card
              key={ingreso.id}
              size="small"
              style={{
                borderRadius: token.borderRadiusLG,
                borderColor: token.colorBorderSecondary,
              }}
            >
              <Flex justify="space-between" align="center">
                {/* Left */}
                <Flex align="center" gap={10}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: token.borderRadius,
                      background: token.colorFillSecondary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <DollarOutlined
                      style={{ color: token.colorPrimary, fontSize: 16 }}
                    />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 14, display: "block" }}>
                      {ingreso.accountName}
                    </Text>
                    <Tag color="blue" style={{ fontSize: 11, marginTop: 2 }}>
                      {ingreso.bank}
                    </Tag>
                  </div>
                </Flex>

                {/* Right */}
                <Flex align="center" gap={8}>
                  <Text
                    strong
                    style={{ fontSize: 15, color: token.colorSuccess }}
                  >
                    + {ingreso.amount.toFixed(2)}{" "}
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {ingreso.currency?.symbol}
                    </Text>
                  </Text>

                  <Popconfirm
                    title="Ingresar movimiento manualmente"
                    description="Este ingreso será agregado como movimiento."
                    onConfirm={() =>
                      addIngresoMutation.mutate({ id: ingreso.id })
                    }
                  >
                    <Button
                      type="text"
                      icon={<ReloadOutlined />}
                      style={{ color: token.colorWarning }}
                    />
                  </Popconfirm>

                  <Popconfirm
                    title="Eliminar ingreso"
                    description="Este ingreso dejará de generar movimientos mensuales."
                    onConfirm={() =>
                      deleteIngresoMutation.mutate({ id: ingreso.id })
                    }
                  >
                    <Button danger type="text" icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Card>
  );
}
