import { forwardRef, useEffect, useImperativeHandle } from "react";
import { App, Button, Form, Typography, Upload } from "antd";
import { isAxiosError } from "axios";
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
  /** Avisa al modal mientras el PDF se sube y procesa, para bloquear acciones duplicadas. */
  onPendingChange?: (pending: boolean) => void;
}

// El backend responde ErrorResponse { statusCode, title, detail }; el detail ya viene en español.
const getErrorDetail = (err: unknown): string | null => {
  if (!isAxiosError(err)) return null;
  const detail: unknown = err.response?.data?.detail;
  return typeof detail === "string" && detail.length > 0 ? detail : null;
};

const ImportMovementTab = forwardRef<unknown, ImportMovementTabProps>(
  ({ onSuccess, onPendingChange }, ref) => {
    const { t } = useTranslation();
    const { message } = App.useApp();
    const [form] = Form.useForm<UploadForm>();

    const uploadMutation = useMutation({
      mutationFn: (form: UploadPayload) => uploadExpenseApi(form),
      onSuccess: () => {
        void message.success(t("movements.import.success"));
        onSuccess?.();
      },
      onError: (err) => {
        console.error("❌ Error subiendo archivo:", err);
        const detail = getErrorDetail(err);
        void message.error(
          detail
            ? t("movements.import.errorWithDetail", { detail })
            : t("movements.import.error"),
        );
      },
    });

    const isUploading = uploadMutation.isPending;
    useEffect(() => {
      onPendingChange?.(isUploading);
    }, [isUploading, onPendingChange]);

    useImperativeHandle(ref, () => ({
      handleConfirm: async () => {
        if (uploadMutation.isPending) return;
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
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            accept=".pdf"
            disabled={isUploading}
          >
            <Button icon={<UploadOutlined />} disabled={isUploading}>{t("movements.import.selectFileButton")}</Button>
          </Upload>
        </Form.Item>
      </Form>
    );
  },
);

export default ImportMovementTab;
