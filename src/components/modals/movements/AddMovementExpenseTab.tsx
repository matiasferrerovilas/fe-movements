import { forwardRef, useImperativeHandle } from "react";
import { Col, DatePicker, Form, Input, InputNumber, Row, Select } from "antd";
import { useGroups } from "../../../apis/hooks/useGroups";
import { useMutation } from "@tanstack/react-query";
import { BankEnum } from "../../../enums/BankEnum";
import { TypeEnum } from "../../../enums/TypeExpense";
import type { CreateMovementForm } from "../../../models/Movement";
import { useCategory } from "../../../apis/hooks/useCategory";
import dayjs from "dayjs";
import { CurrencyEnum } from "../../../enums/CurrencyEnum";
import { uploadExpense } from "../../../apis/movement/ExpenseApi";
import { useCurrency } from "../../../apis/hooks/useCurrency";

interface AddMovementExpenseTabProps {
  onSuccess?: () => void;
}

const AddMovementExpenseTab = forwardRef<unknown, AddMovementExpenseTabProps>(
  ({ onSuccess }, ref) => {
    const { data: accounts = [] } = useGroups();
    const [form] = Form.useForm<CreateMovementForm>();
    const { data: categories = [] } = useCategory();
  const {data: currencies = []} = useCurrency();

    const uploadMutation = useMutation({
      mutationFn: (expenseData: CreateMovementForm) => {
        return uploadExpense(expenseData);
      },
      onSuccess: () => {
        console.debug("✅ Movimiento cargado correctamente");
        onSuccess?.();
      },
      onError: (err) => {
        console.error("❌ Error cargando el movimiento", err);
      },
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

    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={
          accounts && {
            date: dayjs(),
            accountId: accounts[0]?.id,
            currency: CurrencyEnum.ARS,
          }
        }
      >
        <Row gutter={16}>
          <Col span={12}>
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

          <Col span={12}>
            <Form.Item
              name="type"
              label="Tipo"
              rules={[{ required: true, message: "Seleccione un tipo" }]}
            >
              <Select
                placeholder="Seleccionar un tipo movimiento"
                style={{ width: "100%" }}
              >
                {Object.values(TypeEnum).map((type) => (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        {Form.useWatch("type", form) === TypeEnum.CREDITO && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Cuota Actual"
                name="cuotaActual"
                rules={[
                  { required: true, message: "Ingresar cuota actual" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const total = getFieldValue("cuotasTotales");
                      if (!value || !total || value <= total) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "La cuota actual no puede ser mayor que el total"
                        )
                      );
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: "100%" }} controls={false} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Cuotas Totales"
                name="cuotasTotales"
                rules={[
                  { required: true, message: "Ingresar cantidad de cuotas" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} controls={false} />
              </Form.Item>
            </Col>{" "}
          </Row>
        )}
        <Form.Item
          name="accountId"
          label="Grupo"
          rules={[{ required: true, message: "Seleccione un grupo" }]}
        >
          <Select placeholder="Seleccionar grupo">
            {accounts.map((account) => (
              <Select.Option key={account.id} value={account.id}>
                {account.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Descripcion"
              name="description"
              rules={[{ required: true }]}
              style={{ width: "100%" }}
            >
              <Input />
            </Form.Item>{" "}
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Categoria"
              rules={[{ required: true, message: "Seleccione una categoria" }]}
            >
              <Select
                placeholder="Seleccionar categoria"
                showSearch
                style={{ width: "100%" }}
              >
                {Object.values(categories).map((type) => (
                  <Select.Option key={type.id} value={type.description}>
                    {type.description}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Fecha"
          name="date"
          rules={[{ required: true, message: "Seleccione una fecha" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="currency"
              label="Moneda"
              rules={[{ required: true, message: "Ingrese Moneda" }]}
            >
              <Select placeholder="Ingrese Moneda" style={{ width: "100%" }}>
                {currencies.map((currency) => (
                  <Select.Option key={currency.id} value={currency.symbol}>
                    {currency.symbol}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Monto"
              name="amount"
              rules={[{ required: true, message: "Ingresar Monto" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                controls={false}
                precision={2}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
);

export default AddMovementExpenseTab;
