import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Alert,
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  theme,
  Typography,
} from "antd";
import BankOutlined from "@ant-design/icons/BankOutlined";
import CalendarOutlined from "@ant-design/icons/CalendarOutlined";
import CreditCardOutlined from "@ant-design/icons/CreditCardOutlined";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import MinusCircleOutlined from "@ant-design/icons/MinusCircleOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import TagOutlined from "@ant-design/icons/TagOutlined";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TypeEnum, getTypeEnumLabel } from "@/enums/TypeEnum";
import {
  MovementItemUnitEnum,
  getMovementItemUnitLabel,
} from "@/enums/MovementItemUnitEnum";
import {
  MAX_MOVEMENT_CATEGORIES,
  type CreateMovementForm,
  type Movement,
} from "@/models/Movement";
import { useCategory } from "@/apis/hooks/useCategory";
import dayjs from "dayjs";
import {
  updateExpense,
  uploadExpense,
} from "@/apis/movement/MovementApi";
import { useCurrency } from "@/apis/hooks/useCurrency";
import { useBanks } from "@/apis/hooks/useBank";
import { useUserDefault } from "@/apis/hooks/useSettings";

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
  const [form] = Form.useForm<CreateMovementForm>();
  const { t } = useTranslation();
  const typeEnumLabel = getTypeEnumLabel(t);
  const unitLabel = getMovementItemUnitLabel(t);
  // null = todavía no lo tocó el usuario: se muestra según si el movimiento ya tiene items
  // cargados. Una vez que el usuario lo toca, su elección manda (ver Switch más abajo).
  const [userToggledBreakdown, setUserToggledBreakdown] = useState<boolean | null>(null);

  // Las categorías se obtienen del workspace activo del usuario (DEFAULT_WORKSPACE)
  const { data: categories = [] } = useCategory();

  const { data: currencies = [] } = useCurrency();
  const { data: banks = [] } = useBanks();
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
      categories: movementToEdit.categories.map((c) => c.description),
      currency: movementToEdit.currency?.symbol,
      date: dayjs(movementToEdit.date),
      items: movementToEdit.items,
    });
  }, [movementToEdit, form]);

  const showBreakdown = userToggledBreakdown ?? (movementToEdit?.items.length ?? 0) > 0;

  useEffect(() => {
    if (movementToEdit) return;
    const bankDescription = banks.find(
      (b) => b.id === defaultBank?.value,
    )?.description;
    const currencySymbol = currencies.find(
      (c) => c.id === defaultCurrency?.value,
    )?.symbol;
    form.setFieldsValue({
      bank: bankDescription,
      currency: currencySymbol,
      date: dayjs(),
    });
  }, [
    defaultBank,
    defaultCurrency,
    banks,
    currencies,
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
        // Con el toggle apagado no se manda desglose: en alta simplemente no viaja (nunca hubo
        // items); en edición viaja como [] para que el backend borre el desglose que pudiera
        // existir — ver ExpenseToUpdate.items en api-movements (null = no tocar, [] = vaciar).
        const items = showBreakdown ? (values.items ?? []) : (movementToEdit ? [] : undefined);
        uploadMutation.mutate({ ...values, items } as CreateMovementForm);
      } catch (err) {
        console.warn("❌ Validación fallida:", err);
      }
    },
  }));

  const isCreditType = Form.useWatch("type", form) === TypeEnum.CREDITO;
  const watchedItems = Form.useWatch("items", form);
  const watchedAmount = Form.useWatch("amount", form);
  const itemsSum = (watchedItems ?? []).reduce(
    (sum: number, item: { price?: number }) => sum + (item?.price ?? 0),
    0,
  );

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        date: dayjs(),
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
          {t("movements.form.sectionPayment")}
        </Text>
      </Divider>

      <Row gutter={[12, 4]}>
        {/* Monto + Moneda */}
        <Col xs={24} sm={14}>
          <Form.Item
            label={t("movements.form.amountLabel")}
            name="amount"
            rules={[{ required: true, message: t("movements.form.amountRequired") }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              controls={false}
              precision={2}
              placeholder={t("movements.form.amountPlaceholder")}
              prefix={<DollarOutlined style={{ color: token.colorTextTertiary }} />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={10}>
          <Form.Item
            name="currency"
            label={t("movements.form.currencyLabel")}
            rules={[{ required: true, message: t("movements.form.currencyRequired") }]}
          >
            <Select placeholder={t("movements.form.currencyPlaceholder")}>
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
            label={t("movements.form.bankLabel")}
            rules={[{ required: true, message: t("movements.form.bankRequired") }]}
          >
            <Select
              placeholder={t("movements.form.bankPlaceholder")}
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
            label={t("movements.form.typeLabel")}
            rules={[{ required: true, message: t("movements.form.typeRequired") }]}
          >
            <Select
              placeholder={t("movements.form.typePlaceholder")}
              suffixIcon={<CreditCardOutlined style={{ color: token.colorTextTertiary }} />}
            >
              {Object.values(TypeEnum).map((type) => (
                <Select.Option key={type} value={type}>
                  {typeEnumLabel[type]}
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
              title={
                <Row gutter={[12, 0]} style={{ marginTop: 8 }}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={t("movements.form.currentInstallmentLabel")}
                      name="cuotaActual"
                      style={{ marginBottom: 0 }}
                      rules={[
                        {
                          required: true,
                          message: t("movements.form.currentInstallmentRequired"),
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const total = getFieldValue("cuotasTotales");
                            if (!value || !total || value <= total)
                              return Promise.resolve();
                            return Promise.reject(
                              new Error(
                                t(
                                  "movements.form.currentInstallmentExceedsTotal",
                                ),
                              ),
                            );
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        controls={false}
                        placeholder={t(
                          "movements.form.currentInstallmentPlaceholder",
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={t("movements.form.totalInstallmentsLabel")}
                      name="cuotasTotales"
                      style={{ marginBottom: 0 }}
                      rules={[
                        {
                          required: true,
                          message: t(
                            "movements.form.totalInstallmentsRequired",
                          ),
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        controls={false}
                        placeholder={t(
                          "movements.form.totalInstallmentsPlaceholder",
                        )}
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
            label={t("movements.form.dateLabel")}
            name="date"
            rules={[{ required: true, message: t("movements.form.dateRequired") }]}
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
          {t("movements.form.sectionClassification")}
        </Text>
      </Divider>

      <Row gutter={[12, 4]}>
        {/* Descripción + Categoría */}
        <Col xs={24} sm={12}>
          <Form.Item
            label={t("movements.form.descriptionLabel")}
            name="description"
            rules={[
              { required: true, message: t("movements.form.descriptionRequired") },
            ]}
          >
            <Input
              autoFocus
              placeholder={t("movements.form.descriptionPlaceholder")}
              prefix={<TagOutlined style={{ color: token.colorTextTertiary }} />}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="categories"
            label={t("movements.form.categoryLabel")}
            rules={[
              { required: true, message: t("movements.form.categoryRequired") },
            ]}
          >
            <Select
              mode="multiple"
              placeholder={t("movements.form.categoryPlaceholder")}
              showSearch
              maxCount={MAX_MOVEMENT_CATEGORIES}
              options={categories.map((type) => ({
                label: type.description,
                value: type.description,
                key: type.id,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* ── Sección 3: Desglose ───────────────────────────────────────── */}
      <Divider
        titlePlacement="left"
        style={{ marginTop: 4, marginBottom: 16, borderColor: token.colorBorderSecondary }}
      >
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
          {t("movements.form.sectionItems")}
        </Text>
      </Divider>

      <Row style={{ marginBottom: showBreakdown ? 12 : 0 }}>
        <Col span={24}>
          <Switch
            checked={showBreakdown}
            onChange={setUserToggledBreakdown}
            aria-label={t("movements.form.items.toggle")}
          />
          <Text style={{ marginLeft: 8 }}>{t("movements.form.items.toggle")}</Text>
        </Col>
      </Row>

      {showBreakdown && (
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={[8, 4]} align="middle">
                  <Col xs={11} sm={5}>
                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[
                        { required: true, message: t("movements.form.items.quantityRequired") },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        controls={false}
                        min={0.001}
                        placeholder={t("movements.form.items.quantityLabel")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={13} sm={6}>
                    <Form.Item
                      {...restField}
                      name={[name, "unit"]}
                      rules={[
                        { required: true, message: t("movements.form.items.unitRequired") },
                      ]}
                    >
                      <Select placeholder={t("movements.form.items.unitLabel")}>
                        {Object.values(MovementItemUnitEnum).map((unit) => (
                          <Select.Option key={unit} value={unit}>
                            {unitLabel[unit]}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={17} sm={8}>
                    <Form.Item
                      {...restField}
                      name={[name, "description"]}
                      rules={[
                        {
                          required: true,
                          message: t("movements.form.items.descriptionRequired"),
                        },
                      ]}
                    >
                      <Input placeholder={t("movements.form.items.descriptionPlaceholder")} />
                    </Form.Item>
                  </Col>
                  <Col xs={17} sm={4}>
                    <Form.Item
                      {...restField}
                      name={[name, "price"]}
                      rules={[
                        { required: true, message: t("movements.form.items.priceRequired") },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        controls={false}
                        min={0}
                        precision={2}
                        placeholder={t("movements.form.items.priceLabel")}
                        prefix={<DollarOutlined style={{ color: token.colorTextTertiary }} />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={7} sm={1} style={{ textAlign: "center" }}>
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      title={t("movements.form.items.remove")}
                      style={{ color: token.colorTextTertiary, cursor: "pointer" }}
                    />
                  </Col>
                </Row>
              ))}
              <Form.Item style={{ marginBottom: fields.length > 0 ? 4 : 0 }}>
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                  {t("movements.form.items.add")}
                </Button>
              </Form.Item>
              {fields.length > 0 && (
                <Text
                  type={
                    watchedAmount != null && Math.abs(itemsSum - watchedAmount) > 0.01
                      ? "warning"
                      : "secondary"
                  }
                  style={{ fontSize: 12 }}
                >
                  {t("movements.form.items.sum", { sum: itemsSum.toFixed(2) })}
                  {watchedAmount != null && Math.abs(itemsSum - watchedAmount) > 0.01 &&
                    ` — ${t("movements.form.items.sumMismatch", { amount: watchedAmount.toFixed(2) })}`}
                </Text>
              )}
            </>
          )}
        </Form.List>
      )}
    </Form>
  );
});

export default AddMovementExpenseTab;
