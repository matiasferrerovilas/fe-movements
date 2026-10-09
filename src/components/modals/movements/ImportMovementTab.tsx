import { forwardRef, useImperativeHandle } from "react";
import { Button, Form, Typography, Upload } from "antd";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { UploadChangeParam, UploadFile } from "antd/es/upload";
import { uploadExpenseApi } from "@/apis/movement/MovementApi";
const { Text } = Typography;

// Único banco con parser en api-movements: el backend detecta solo si el PDF es el export de
// movimientos de cuenta o el extracto de la tarjeta, así que no hace falta elegir nada más.
const IMPORT_BANK = "SANTANDER";

export interface UploadForm {
  fileList: UploadFile<File>[] | null;
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

    useImperativeHandle(ref, () => ({
      handleConfirm: async () => {
        const values = await form.validateFields();

        const file = values.fileList?.[0]?.originFileObj ?? null;

        uploadMutation.mutate({
          file,
          bank: IMPORT_BANK,
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
      <Form form={form} layout="vertical">
        <div style={{ marginBottom: 10 }}>
          <Text type="secondary">
            {t("movements.import.introPrefix")} <strong>PDF</strong>.
            <br />
            {t("movements.import.supportedBanks")}
          </Text>
        </div>
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
