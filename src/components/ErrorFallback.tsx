import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";

export function ErrorFallback({ onReload }: { onReload: () => void }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <Result
        status="500"
        title={t("common.errorBoundary.title")}
        subTitle={t("common.errorBoundary.subtitle")}
        extra={
          <Button type="primary" onClick={onReload}>
            {t("common.errorBoundary.reloadButton")}
          </Button>
        }
      />
    </div>
  );
}
