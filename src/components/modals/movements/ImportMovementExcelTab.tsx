import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Button, Form, message, Select, Typography, Upload } from "antd";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import { useMutation } from "@tanstack/react-query";
import { useBanks } from "../../../apis/hooks/useBank";
import { useUserDefault } from "../../../apis/hooks/useSettings";
import type { UploadChangeParam, UploadFile } from "antd/es/upload";
import { uploadExpenseApi } from "../../../apis/movement/ExpenseApi";
import type { UploadForm, UploadPayload } from "./ImportMovementTab";

const { Text } = Typography;

interface ImportMovementExcelTabProps {
  onSuccess?: () => void;
}

const ImportMovementExcelTab = forwardRef<unknown, ImportMovementExcelTabProps>(
  ({ onSuccess }, ref) => {
    const { data: banks = [] } = useBanks();
    const { data: defaultBank } = useUserDefault("DEFAULT_BANK");
    const [form] = Form.useForm<UploadForm>();

    const uploadMutation = useMutation({
      mutationFn: (form: UploadPayload) => uploadExpenseApi(form),
      onSuccess: () => {
        console.debug("✅ Archivo Excel/CSV subido correctamente");
        message.success("Movimientos importados correctamente");
        onSuccess?.();
      },
      onError: (err: Error) => {
        console.error("❌ Error subiendo archivo Excel/CSV:", err);
        message.error(err.message || "Error al importar archivo");
      },
    });

    useEffect(() => {
      const bankDescription = banks.find(
        (b) => b.id === defaultBank?.value
      )?.description;
      form.setFieldsValue({
        bank: bankDescription,
      });
    }, [defaultBank, banks, form]);

    useImperativeHandle(ref, () => ({
      handleConfirm: async () => {
        const values = await form.validateFields();

        const file = values.fileList?.[0]?.originFileObj ?? null;

        uploadMutation.mutate({
          file,
          bank: values.bank,
        });
      },
    }));

    const normFile = (e: UploadChangeParam<UploadFile<File>>) => {
      if (Array.isArray(e)) {
        return e;
      }
      return e?.fileList;
    };

    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          bank: banks.find((b) => b.id === defaultBank?.value)?.description,
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <Text type="secondary">
            Podés importar tu resumen bancario en formato{" "}
            <strong>Excel o CSV</strong>.
            <br />
            Banco soportado: Santander.
            <br />
            El archivo debe contener las columnas:{" "}
            <strong>FECHA, CONCEPTO, IMPORTE, SALDO</strong>.
          </Text>
        </div>
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

        <Form.Item
          name="fileList"
          label="Archivo"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "Seleccione un archivo" }]}
        >
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            accept=".xls,.xlsx,.csv"
          >
            <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>
          </Upload>
        </Form.Item>
      </Form>
    );
  },
);

export default ImportMovementExcelTab;
