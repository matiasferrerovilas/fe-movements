import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Button, Form, Select, Typography, Upload } from "antd";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useBanks } from "@/apis/hooks/useBank";
import { useUserDefault } from "@/apis/hooks/useSettings";
import type { UploadChangeParam, UploadFile } from "antd/es/upload";
import { uploadExpenseApi } from "@/apis/movement/MovementApi";
const { Text } = Typography;

export interface UploadForm {
  fileList: UploadFile<File>[] | null;
  bank: string | null;
}

export interface UploadPayload {
  file: File | null;
  bank: string | null;
}

interface ImportMovementTabProps {
  onSuccess?: () => void;
}

const ImportMovementTab = forwardRef<unknown, ImportMovementTabProps>(
  ({ onSuccess }, ref) => {
    const { t } = useTranslation();
    const { data: banks = [] } = useBanks();
    const { data: defaultBank } = useUserDefault("DEFAULT_BANK");
    const [form] = Form.useForm<UploadForm>();

    const uploadMutation = useMutation({
      mutationFn: (form: UploadPayload) => uploadExpenseApi(form),
      onSuccess: () => {
        console.debug("✅ Archivo subido correctamente");
        onSuccess?.();
      },
      onError: (err) => {
        console.error("❌ Error subiendo archivo:", err);
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
            {t("movements.import.introPrefix")} <strong>PDF</strong>.
            <br />
            {t("movements.import.supportedBanks")}
            <br />
            {t("movements.import.creditCardOnlyPrefix")} <strong>
              {t("movements.import.creditCardOnlyBold")}
            </strong>{" "}
            {t("movements.import.creditCardOnlySuffix")}
          </Text>
        </div>
        <Form.Item
          name="bank"
          label={t("movements.form.bankLabel")}
          rules={[{ required: true, message: t("movements.form.bankRequired") }]}
        >
          <Select placeholder={t("movements.form.bankPlaceholder")}>
            {banks.map((bank) => (
              <Select.Option key={bank.id} value={bank.description}>
                {bank.description}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="fileList"
          label={t("movements.import.fileLabel")}
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: t("movements.import.fileRequired") }]}
        >
          <Upload beforeUpload={() => false} maxCount={1} accept=".pdf">
            <Button icon={<UploadOutlined />}>{t("movements.import.selectFileButton")}</Button>
          </Upload>
        </Form.Item>
      </Form>
    );
  },
);

export default ImportMovementTab;
