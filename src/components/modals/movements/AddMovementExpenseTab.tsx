import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Col, DatePicker, Form, Input, InputNumber, Row, Select } from "antd";
import { useGroups } from "../../../apis/hooks/useGroups";
import { useMutation } from "@tanstack/react-query";
import { BankEnum } from "../../../enums/BankEnum";
import { TypeEnum } from "../../../enums/TypeExpense";
import type { CreateMovementForm, Movement } from "../../../models/Movement";
import { useCategory } from "../../../apis/hooks/useCategory";
import dayjs from "dayjs";
import { CurrencyEnum } from "../../../enums/CurrencyEnum";
import {
  updateExpense,
  uploadExpense,
} from "../../../apis/movement/ExpenseApi";
import { useCurrency } from "../../../apis/hooks/useCurrency";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

interface AddMovementExpenseTabProps {
  onSuccess?: () => void;
  movementToEdit?: Movement;
}

const dateFormat = "YYYY/MM/DD";

const AddMovementExpenseTab = forwardRef<
  { handleConfirm: () => void },
  AddMovementExpenseTabProps
>(({ onSuccess, movementToEdit }, ref) => {
  const { data: memberships = [] } = useGroups();
  const [form] = Form.useForm<CreateMovementForm>();
  const { data: categories = [] } = useCategory();
  const { data: currencies = [] } = useCurrency();

  useEffect(() => {
    if (!movementToEdit) return;
    form.setFieldsValue({
      bank: movementToEdit.bank,
      description: movementToEdit.description,
      amount: movementToEdit.amount,
      type: movementToEdit.type,
      cuotaActual: movementToEdit.cuotaActual ?? undefined,
      cuotasTotales: movementToEdit.cuotasTotales ?? undefined,
      groupId: movementToEdit.account?.id,
      category: movementToEdit.category?.description,
      currency: movementToEdit.currency?.symbol,
      date: dayjs(movementToEdit.date),
    });
  }, [movementToEdit, form]);

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
        const date = dayjs(values.date)
          .hour(12)
          .minute(0)
          .second(0)
          .millisecond(0)
          .toDate();
        uploadMutation.mutate({ ...values, date } as CreateMovementForm);
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
      initialValues={
        memberships && {
          date: dayjs(),
          groupId: memberships.find((m) => m.isDefault)?.groupId,
          currency: CurrencyEnum.ARS,
        }
      }
    >
      <Row gutter={[12, 0]}>
        {/* Banco + Tipo */}
        <Col xs={24} sm={12}>
          <Form.Item
            name="bank"
            label="Banco"
            rules={[{ required: true, message: "Seleccione un banco" }]}
          >
            <Select placeholder="Seleccionar banco">
              {Object.entries(BankEnum).map(([key, label]) => (
                <Select.Option key={key} value={key}>
                  {label}
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
            <Select placeholder="Seleccionar tipo">
              {Object.values(TypeEnum).map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Cuotas (solo si es CREDITO) */}
        {isCreditType && (
          <>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Cuota Actual"
                name="cuotaActual"
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
                <InputNumber style={{ width: "100%" }} controls={false} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Cuotas Totales"
                name="cuotasTotales"
                rules={[
                  { required: true, message: "Ingresar cantidad de cuotas" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} controls={false} />
              </Form.Item>
            </Col>
          </>
        )}

        {/* Grupo */}
        <Col xs={24}>
          <Form.Item
            name="groupId"
            label="Grupo"
            rules={[{ required: true, message: "Seleccione un grupo" }]}
          >
            <Select
              placeholder="Seleccionar grupo"
              options={memberships.map((membership) => ({
                label: membership.groupDescription,
                value: membership.groupId,
                key: membership.groupId,
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
            <Input placeholder="Ej: Supermercado, Nafta..." />
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

        {/* Fecha */}
        <Col xs={24}>
          <Form.Item
            label="Fecha"
            name="date"
            rules={[{ required: true, message: "Seleccione una fecha" }]}
          >
            <DatePicker style={{ width: "100%" }} format={dateFormat} />
          </Form.Item>
        </Col>

        {/* Moneda + Monto */}
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
            label="Monto"
            name="amount"
            rules={[{ required: true, message: "Ingresar Monto" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              controls={false}
              precision={2}
              placeholder="0.00"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
});

export default AddMovementExpenseTab;
