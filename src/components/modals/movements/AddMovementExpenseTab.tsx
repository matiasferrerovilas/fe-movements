import { forwardRef, useEffect, useImperativeHandle } from "react";
import {
  Alert,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  theme,
  Typography,
} from "antd";
import BankOutlined from "@ant-design/icons/BankOutlined";
import CalendarOutlined from "@ant-design/icons/CalendarOutlined";
import CreditCardOutlined from "@ant-design/icons/CreditCardOutlined";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import TagOutlined from "@ant-design/icons/TagOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import { useWorkspaces } from "../../../apis/hooks/useWorkspaces";
import { useMutation } from "@tanstack/react-query";
import { TypeEnum, TypeEnumLabel } from "../../../enums/TypeExpense";
import type { CreateMovementForm, Movement } from "../../../models/Movement";
import { useCategory } from "../../../apis/hooks/useCategory";
import dayjs from "dayjs";
import {
  updateExpense,
  uploadExpense,
} from "../../../apis/movement/ExpenseApi";
import { useCurrency } from "../../../apis/hooks/useCurrency";
import { useBanks } from "../../../apis/hooks/useBank";
import { useUserDefault } from "../../../apis/hooks/useSettings";

const { Text } = Typography;

interface AddMovementExpenseTabProps {
  onSuccess?: () => void;
  movementToEdit?: Movement;
}

const dateFormat = "DD/MM/YYYY";

const AddMovementExpenseTab = forwardRef<
  { handleConfirm: () => void },
  AddMovementExpenseTabProps
>(({ onSuccess, movementToEdit }, ref) => {
  const { token } = theme.useToken();
  const { data: memberships = [] } = useWorkspaces();
  const [form] = Form.useForm<CreateMovementForm>();
  const { data: categories = [] } = useCategory();
  const { data: currencies = [] } = useCurrency();
  const { data: banks = [] } = useBanks();
  const { data: defaultAccount } = useUserDefault("DEFAULT_WORKSPACE");
  const { data: defaultBank } = useUserDefault("DEFAULT_BANK");
  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");

  useEffect(() => {
    if (!movementToEdit) return;
    form.setFieldsValue({
      bank: movementToEdit.bank,
      description: movementToEdit.description,
      amount: movementToEdit.amount,
      type: movementToEdit.type,
      cuotaActual: movementToEdit.cuotaActual ?? undefined,
      cuotasTotales: movementToEdit.cuotasTotales ?? undefined,
      workspaceId: movementToEdit.account?.id,
      category: movementToEdit.category?.description,
      currency: movementToEdit.currency?.symbol,
      date: dayjs(movementToEdit.date),
    });
  }, [movementToEdit, form]);

  useEffect(() => {
    if (movementToEdit) return;
    const bankDescription = banks.find(
      (b) => b.id === defaultBank?.value,
    )?.description;
    const currencySymbol = currencies.find(
      (c) => c.id === defaultCurrency?.value,
    )?.symbol;
    form.setFieldsValue({
      workspaceId: defaultAccount?.value ?? undefined,
      bank: bankDescription,
      currency: currencySymbol,
      date: dayjs(),
    });
  }, [
    defaultAccount,
    defaultBank,
    defaultCurrency,
    banks,
    currencies,
    memberships,
    form,
    movementToEdit,
  ]);

  const uploadMutation = useMutation({
    mutationFn: (values: CreateMovementForm) =>
      movementToEdit
        ? updateExpense(movementToEdit.id, values)
        : uploadExpense(values),
    onSuccess: () => {
      console.debug("✅ Movimiento cargado correctamente");
      onSuccess?.();
    },
    onError: (err) => console.error("❌ Error cargando el movimiento", err),
  });

  useImperativeHandle(ref, () => ({
    handleConfirm: async () => {
      try {
        const values = await form.validateFields();
        uploadMutation.mutate(values as CreateMovementForm);
      } catch (err) {
        console.warn("❌ Validación fallida:", err);
      }
    },
  }));

  const isCreditType = Form.useWatch("type", form) === TypeEnum.CREDITO;

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        date: dayjs(),
        workspaceId: defaultAccount?.value ?? undefined,
        bank: banks.find((b) => b.id === defaultBank?.value)?.description,
        currency: currencies.find((c) => c.id === defaultCurrency?.value)?.symbol,
      }}
    >
      {/* ── Sección 1: Pago ───────────────────────────────────────────── */}
      <Divider
        titlePlacement="left"
        style={{ marginTop: 4, marginBottom: 16, borderColor: token.colorBorderSecondary }}
      >
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
          Pago
        </Text>
      </Divider>

      <Row gutter={[12, 4]}>
        {/* Monto + Moneda */}
        <Col xs={24} sm={14}>
          <Form.Item
            label="Monto"
            name="amount"
            rules={[{ required: true, message: "Ingresar Monto" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              controls={false}
              precision={2}
              placeholder="0.00"
              prefix={<DollarOutlined style={{ color: token.colorTextTertiary }} />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={10}>
          <Form.Item
            name="currency"
            label="Moneda"
            rules={[{ required: true, message: "Ingrese Moneda" }]}
          >
            <Select placeholder="Moneda">
              {currencies.map((currency) => (
                <Select.Option key={currency.id} value={currency.symbol}>
                  {currency.symbol}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Banco + Tipo */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="bank"
            label="Banco"
            rules={[{ required: true, message: "Seleccione un banco" }]}
          >
            <Select
              placeholder="Seleccionar banco"
              suffixIcon={<BankOutlined style={{ color: token.colorTextTertiary }} />}
            >
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
            name="type"
            label="Tipo"
            rules={[{ required: true, message: "Seleccione un tipo" }]}
          >
            <Select
              placeholder="Seleccionar tipo"
              suffixIcon={<CreditCardOutlined style={{ color: token.colorTextTertiary }} />}
            >
              {Object.values(TypeEnum).map((type) => (
                <Select.Option key={type} value={type}>
                  {TypeEnumLabel[type]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Cuotas — solo si es CREDITO */}
        {isCreditType && (
          <Col xs={24}>
            <Alert
              type="info"
              showIcon
              message={
                <Row gutter={[12, 0]} style={{ marginTop: 8 }}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Cuota Actual"
                      name="cuotaActual"
                      style={{ marginBottom: 0 }}
                      rules={[
                        { required: true, message: "Ingresar cuota actual" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const total = getFieldValue("cuotasTotales");
                            if (!value || !total || value <= total)
                              return Promise.resolve();
                            return Promise.reject(
                              new Error(
                                "La cuota actual no puede ser mayor que el total",
                              ),
                            );
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        controls={false}
                        placeholder="Ej: 3"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Cuotas Totales"
                      name="cuotasTotales"
                      style={{ marginBottom: 0 }}
                      rules={[
                        {
                          required: true,
                          message: "Ingresar cantidad de cuotas",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        controls={false}
                        placeholder="Ej: 12"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              }
              description=""
              style={{
                marginBottom: 12,
                paddingBottom: 12,
                borderColor: token.colorInfoBorder,
              }}
            />
          </Col>
        )}

        {/* Fecha */}
        <Col xs={24}>
          <Form.Item
            label="Fecha"
            name="date"
            rules={[{ required: true, message: "Seleccione una fecha" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format={dateFormat}
              suffixIcon={<CalendarOutlined style={{ color: token.colorTextTertiary }} />}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* ── Sección 2: Clasificación ──────────────────────────────────── */}
      <Divider
        titlePlacement="left"
        style={{ marginTop: 4, marginBottom: 16, borderColor: token.colorBorderSecondary }}
      >
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
          Clasificación
        </Text>
      </Divider>

      <Row gutter={[12, 4]}>
        {/* Workspace */}
        <Col xs={24}>
          <Form.Item
            name="workspaceId"
            label="Workspace"
            rules={[{ required: true, message: "Seleccione un workspace" }]}
          >
            <Select
              placeholder="Seleccionar workspace"
              suffixIcon={<TeamOutlined style={{ color: token.colorTextTertiary }} />}
              options={memberships.map((membership) => ({
                label: membership.workspaceName,
                value: membership.workspaceId,
                key: membership.workspaceId,
              }))}
            />
          </Form.Item>
        </Col>

        {/* Descripción + Categoría */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="Descripción"
            name="description"
            rules={[{ required: true, message: "Ingrese una descripción" }]}
          >
            <Input
              placeholder="Ej: Supermercado, Nafta..."
              prefix={<TagOutlined style={{ color: token.colorTextTertiary }} />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="category"
            label="Categoría"
            rules={[{ required: true, message: "Seleccione una categoría" }]}
          >
            <Select
              placeholder="Seleccionar categoría"
              showSearch
              options={categories.map((type) => ({
                label: type.description,
                value: type.description,
                key: type.id,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
});

export default AddMovementExpenseTab;
