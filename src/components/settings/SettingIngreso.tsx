import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Space,
  theme,
  Typography,
} from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGroups } from "../../apis/hooks/useGroups";
import { useIncome } from "../../apis/hooks/useIncome";
import { DeleteOutlined, PlusOutlined, TeamOutlined } from "@ant-design/icons";
import { addIncome, deleteIncome } from "../../apis/income/IncomeAPI";
import type { Income, IncomeAddForm } from "../../models/Income";
import { CurrencyEnum } from "../../enums/CurrencyEnum";
import { BankEnum } from "../../enums/BankEnum";
const { Title } = Typography;

export function SettingIngreso() {
  const [form] = Form.useForm<IncomeAddForm>();
  const { data: ingresos, isLoading } = useIncome();
  const { token } = theme.useToken();
  const { data: userGroups = [] } = useGroups();

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
  const onFinish = (values: IncomeAddForm) => {
    createIngresoMutation.mutate({ income: values });
    form.resetFields();
  };

  return (
    <Card loading={isLoading}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={24}>
          <Space align="baseline">
            <TeamOutlined style={{ fontSize: 20, color: "#0D59A4" }} />
            <Title level={5} style={{ margin: 0 }}>
              Gestionar Ingresos
            </Title>
          </Space>
          <Typography.Paragraph
            style={{
              color: token.colorTextSecondary,
              marginBottom: 8,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Configurá tu ingreso mensual indicando el monto, la moneda y el
            grupo. Se generará automáticamente un movimiento una vez por mes con
            estos datos.
          </Typography.Paragraph>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: 12,
          background: "#e8ebf0",
          padding: 0,
          marginBottom: 20,
        }}
      >
        <Title
          level={5}
          style={{
            margin: 0,
            color: "#111827",
          }}
        >
          Agregar Ingreso
        </Title>
        <Form
          form={form}
          layout="vertical"
          style={{ width: "100%" }}
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={12}>
              <Form.Item
                name="bank"
                label="Banco"
                rules={[{ required: true, message: "Seleccione un banco" }]}
              >
                <Select placeholder="Seleccionar banco">
                  {Object.values(BankEnum).map((bank) => (
                    <Select.Option key={bank} value={bank}>
                      {bank}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={12}>
              <Form.Item
                name="group"
                label="Grupo"
                rules={[{ required: true, message: "Seleccione un grupo" }]}
              >
                <Select placeholder="Seleccionar grupo">
                  {userGroups.map((group) => (
                    <Select.Option key={group.id} value={group.description}>
                      {group.description}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} lg={12}>
              <Form.Item
                name="currency"
                label="Moneda"
                rules={[{ required: true, message: "Ingrese Moneda" }]}
              >
                <Select placeholder="Ingrese Moneda" style={{ width: "100%" }}>
                  {Object.values(CurrencyEnum).map((currency) => (
                    <Select.Option key={currency} value={currency}>
                      {currency}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={12}>
              <Form.Item
                label="Monto"
                name="amount"
                rules={[{ required: true, message: "Ingresar Monto" }]}
              >
                <InputNumber
                  precision={2}
                  style={{ width: "100%" }}
                  controls={false}
                />
              </Form.Item>
            </Col>
          </Row>
          <Button
            icon={<PlusOutlined />}
            block
            htmlType="submit"
            loading={createIngresoMutation.isPending}
            style={{ borderRadius: 8, height: 40 }}
          >
            Agregar ingreso
          </Button>
        </Form>
        {ingresos?.length === 0 ? (
          <Empty
            description="Todavía no configuraste ingresos"
            style={{ marginTop: 24 }}
          />
        ) : (
          <Space
            orientation="vertical"
            size={12}
            style={{ width: "100%", marginTop: 10 }}
          >
            {ingresos?.map((ingreso: Income) => (
              <Card
                key={ingreso.id}
                size="small"
                style={{
                  borderRadius: 12,
                  background: "#fafafa",
                }}
              >
                <Row justify="space-between" align="middle">
                  {/* Izquierda */}
                  <Col>
                    <Typography.Text strong style={{ fontSize: 14 }}>
                      {ingreso.groups.description}
                    </Typography.Text>

                    <br />

                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {ingreso.bank}
                    </Typography.Text>
                  </Col>

                  {/* Derecha */}
                  <Space align="center">
                    <Typography.Text strong style={{ fontSize: 14 }}>
                      {ingreso.amount.toFixed(2)} {ingreso.currency?.symbol}
                    </Typography.Text>

                    <Popconfirm
                      title="Eliminar ingreso"
                      description="Este ingreso dejará de generar movimientos mensuales."
                      onConfirm={() =>
                        deleteIngresoMutation.mutate({ id: ingreso.id })
                      }
                    >
                      <Button danger type="text" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </Row>
              </Card>
            ))}
          </Space>
        )}
      </Card>
    </Card>
  );
}
