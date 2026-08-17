import SwapRightOutlined from "@ant-design/icons/SwapRightOutlined";
import RetweetOutlined from "@ant-design/icons/RetweetOutlined";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Popconfirm,
  Row,
  Select,
  theme,
  Typography,
  App,
} from "antd";
import { useKeycloak } from "@react-keycloak/web";
import { useTranslation } from "react-i18next";
import { useCategory, useMigrateCategory } from "@/apis/hooks/useCategory";

const { Title, Text } = Typography;

interface MigrateCategoryForm {
  fromCategoryId: number;
  toCategoryId: number;
}

export function SettingCategoryMigrate() {
  const { t } = useTranslation();
  const { keycloak } = useKeycloak();
  const roles: string[] =
    (keycloak?.tokenParsed?.realm_access?.roles as string[]) ?? [];
  const isAdmin =
    roles.includes("ROLE_ADMIN") || roles.includes("ADMIN");

  // Las categorías se obtienen del workspace activo del usuario (DEFAULT_WORKSPACE)
  const { data: categories = [] } = useCategory();
  const migrateMutation = useMigrateCategory();
  const [form] = Form.useForm<MigrateCategoryForm>();
  const { message } = App.useApp();
  const { token } = theme.useToken();

  const fromCategoryId = Form.useWatch("fromCategoryId", form);
  const toCategoryId = Form.useWatch("toCategoryId", form);

  if (!isAdmin) return null;

  const fromCategory = categories.find((c) => c.id === fromCategoryId);
  const toCategory = categories.find((c) => c.id === toCategoryId);

  const onConfirm = () => {
    form
      .validateFields()
      .then((values) => {
        migrateMutation.mutate(values, {
          onSuccess: () => {
            message.success(
              t("settings.categoryMigrate.successMessage", {
                from: fromCategory?.description,
                to: toCategory?.description,
              }),
            );
            form.resetFields();
          },
          onError: () => {
            message.error(t("settings.categoryMigrate.errorMessage"));
          },
        });
      })
      .catch(() => {});
  };

  const confirmTitle =
    fromCategory && toCategory
      ? t("settings.categoryMigrate.confirmTitleWithNames", {
          from: fromCategory.description,
          to: toCategory.description,
        })
      : t("settings.categoryMigrate.confirmTitleDefault");

  const confirmDescription = t("settings.categoryMigrate.confirmDescription");

  return (
    <Card
      style={{
        borderRadius: 16,
        border: `1.5px dashed ${token.colorWarningBorder}`,
        background: token.colorWarningBg,
        marginTop: 20,
      }}
      styles={{ body: { padding: "18px 20px" } }}
    >
      {/* Header */}
      <Flex align="center" gap={10} style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${token.colorWarningActive}, ${token.colorWarning})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 10px ${token.colorWarningBorder}`,
            flexShrink: 0,
          }}
        >
          <RetweetOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0, color: token.colorWarningText }}>
            {t("settings.categoryMigrate.title")}
          </Title>
          <Text style={{ fontSize: 12, color: token.colorWarningText }}>
            {t("settings.categoryMigrate.subtitle")}
          </Text>
        </div>
      </Flex>

      <Divider style={{ margin: "14px 0", borderColor: token.colorWarningBorder }} />

      <Form form={form} layout="vertical">
        <Row gutter={[12, 0]} align="middle">
          <Col xs={24} sm={10}>
            <Form.Item
              name="fromCategoryId"
              label={
                <Text style={{ fontSize: 13, color: token.colorWarningText, fontWeight: 600 }}>
                  {t("settings.categoryMigrate.fromLabel")}
                </Text>
              }
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: t("settings.categoryMigrate.fromRequired") },
              ]}
            >
              <Select
                placeholder={t("settings.categoryMigrate.fromPlaceholder")}
                style={{ width: "100%" }}
                options={categories
                  .filter((c) => c.id !== toCategoryId)
                  .map((c) => ({ value: c.id, label: c.description }))}
              />
            </Form.Item>
          </Col>

          <Col
            xs={24}
            sm={4}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 22,
            }}
          >
            <SwapRightOutlined
              style={{ fontSize: 22, color: token.colorWarning }}
            />
          </Col>

          <Col xs={24} sm={10}>
            <Form.Item
              name="toCategoryId"
              label={
                <Text style={{ fontSize: 13, color: token.colorWarningText, fontWeight: 600 }}>
                  {t("settings.categoryMigrate.toLabel")}
                </Text>
              }
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: t("settings.categoryMigrate.toRequired") },
              ]}
            >
              <Select
                placeholder={t("settings.categoryMigrate.toPlaceholder")}
                style={{ width: "100%" }}
                options={categories
                  .filter((c) => c.id !== fromCategoryId)
                  .map((c) => ({ value: c.id, label: c.description }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex justify="flex-end" style={{ marginTop: 16 }}>
          <Popconfirm
            title={confirmTitle}
            description={confirmDescription}
            onConfirm={onConfirm}
            okText={t("settings.categoryMigrate.migrateButton")}
            cancelText={t("settings.categoryMigrate.cancelButton")}
            okButtonProps={{
              loading: migrateMutation.isPending,
            }}
            disabled={!fromCategoryId || !toCategoryId}
          >
            <Button
              type="primary"
              style={{
                height: 40,
                borderRadius: 10,
                fontWeight: 600,
              }}
              loading={migrateMutation.isPending}
              disabled={!fromCategoryId || !toCategoryId}
            >
              {t("settings.categoryMigrate.migrateButton")}
            </Button>
          </Popconfirm>
        </Flex>
      </Form>
    </Card>
  );
}
