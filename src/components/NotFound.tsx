import { Button, Result } from "antd";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <Result
      status="404"
      title={t("common.notFound.title")}
      subTitle={t("common.notFound.subtitle")}
      extra={
        <Link to="/">
          <Button type="primary">{t("common.notFound.homeButton")}</Button>
        </Link>
      }
    />
  );
}
