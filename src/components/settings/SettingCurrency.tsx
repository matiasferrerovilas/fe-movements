import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import StarFilled from "@ant-design/icons/StarFilled";
import StarOutlined from "@ant-design/icons/StarOutlined";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Popconfirm,
  Row,
  Space,
  theme,
  Tooltip,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import {
  useAddCurrency,
  useCurrency,
  useDeleteCurrency,
} from "@/apis/hooks/useCurrency";
import { useUserDefault, useSetUserDefault } from "@/apis/hooks/useSettings";
import type { Currency } from "@/models/Currency";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { getEntityLabels } from "@/utils/entityLabels";

const { Title, Text } = Typography;

interface AddCurrencyForm {
  symbol: string;
  description: string;
}

interface CurrencyCardProps {
  currency: Currency;
  defaultCurrencyId?: number | null;
  onSetDefault: (id: number) => void;
  isSettingDefault?: boolean;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  monedasQuitar: string;
}

function CurrencyCard({
  currency,
  defaultCurrencyId,
  onSetDefault,
  isSettingDefault,
  onDelete,
  isDeleting,
  monedasQuitar,
}: CurrencyCardProps) {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const isDefault = currency.id === defaultCurrencyId;
  const canDelete = currency.isDeletable && !isDefault;

  return (
    <Card
      hoverable
      styles={{ body: { padding: "14px 18px", cursor: "default" } }}
      style={{
        borderRadius: 16,
        border: `1.5px solid ${isDefault ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
        background: isDefault ? token.colorPrimaryBg : token.colorFillAlter,
        transition: "all 0.25s ease",
        overflow: "hidden",
      }}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={14}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: isDefault
                ? `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`
                : `linear-gradient(135deg, ${token.colorFill} 0%, ${token.colorFillSecondary} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isDefault
                ? `0 4px 14px ${token.colorPrimaryBorder}`
                : "0 2px 6px rgba(0,0,0,0.08)",
              flexShrink: 0,
              transition: "all 0.25s ease",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "-0.5px",
                lineHeight: 1,
              }}
            >
              {currency.symbol}
            </Text>
          </div>
          <Flex vertical gap={3}>
            <Flex align="center" gap={8}>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: token.colorText,
                  letterSpacing: "-0.2px",
                  lineHeight: 1,
                }}
              >
                {currency.description}
              </Text>
              {isDefault && (
                <span
                  style={{
                    background: `linear-gradient(90deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
                    borderRadius: 20,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    padding: "2px 9px",
                    textTransform: "uppercase",
                    lineHeight: "18px",
                  }}
                >
                  ★ {t("settings.currency.defaultBadge")}
                </span>
              )}
            </Flex>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {currency.symbol}
            </Text>
          </Flex>
        </Flex>
        <Space size={4}>
          <Tooltip
            title={
              isDefault
                ? t("settings.currency.starTooltipDefault")
                : t("settings.currency.starTooltipSetDefault")
            }
          >
            <Button
              type="text"
              aria-label={t("settings.currency.starAriaLabel", { name: currency.description })}
              style={{
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              disabled={isDefault || isSettingDefault}
              onClick={() => onSetDefault(currency.id)}
              icon={
                isDefault ? (
                  <StarFilled style={{ color: token.colorWarning, fontSize: 18 }} />
                ) : (
                  <StarOutlined style={{ color: token.colorTextQuaternary, fontSize: 18 }} />
                )
              }
            />
          </Tooltip>
          <Tooltip
            title={
              isDefault
                ? t("settings.currency.deleteTooltipDefault")
                : !currency.isDeletable
                  ? t("settings.currency.deleteTooltipDisabled")
                  : t("settings.currency.deleteTooltipEnabled")
            }
          >
            <Popconfirm
              title={t("settings.currency.deleteConfirmTitle")}
              description={monedasQuitar}
              onConfirm={() => onDelete(currency.id)}
              okText={t("settings.currency.deleteConfirmOk")}
              cancelText={t("settings.currency.deleteConfirmCancel")}
              okButtonProps={{ danger: true }}
              disabled={!canDelete}
            >
              <Button
                type="text"
                danger
                aria-label={t("settings.currency.deleteAriaLabel", { name: currency.description })}
                style={{
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                disabled={!canDelete || isDeleting}
                icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      </Flex>
    </Card>
  );
}

export function SettingCurrency() {
  const { data: currencies = [], isLoading } = useCurrency();
  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");
  const setDefaultMutation = useSetUserDefault();
  const addCurrencyMutation = useAddCurrency();
  const deleteCurrencyMutation = useDeleteCurrency();
  const [form] = Form.useForm<AddCurrencyForm>();
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null, t);

  const onFinish = (values: AddCurrencyForm) => {
    addCurrencyMutation.mutate(
      { symbol: values.symbol, description: values.description },
      { onSuccess: () => form.resetFields() },
    );
  };

  return (
    <Card loading={isLoading} style={{ borderRadius: 16 }}>
      {/* Header */}
      <Flex align="center" gap={10} style={{ marginBottom: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 10px ${token.colorPrimaryBorder}`,
          }}
        >
          <DollarOutlined style={{ color: "#fff", fontSize: 18 }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {t("settings.currency.title")}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {labels.monedasSubtitle}
          </Text>
        </div>
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      {!isLoading && currencies.length === 0 && (
        <Alert
          type="warning"
          showIcon
          title={t("settings.currency.requiredNoticeTitle")}
          description={t("settings.currency.requiredNoticeDescription")}
          style={{ borderRadius: 12, marginBottom: 16 }}
        />
      )}

      {/* Agregar moneda */}
      <Card
        styles={{ body: { padding: "14px 16px" } }}
        style={{
          borderRadius: 14,
          border: `1.5px dashed ${token.colorPrimaryBorder}`,
          background: token.colorPrimaryBg,
          marginBottom: 20,
        }}
      >
        <Text
          strong
          style={{
            fontSize: 13,
            color: token.colorText,
            display: "block",
            marginBottom: 10,
          }}
        >
          {t("settings.currency.newCurrencyLabel")}
        </Text>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={[12, 0]} align="middle">
            <Col xs={24} sm={6} md={5}>
              <Form.Item
                name="symbol"
                style={{ margin: 0 }}
                rules={[
                  { required: true, message: t("settings.currency.symbolRequired") },
                ]}
              >
                <Input
                  style={{ borderRadius: 10, height: 40, fontSize: 14 }}
                  placeholder={t("settings.currency.symbolPlaceholder")}
                  maxLength={10}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={13}>
              <Form.Item
                name="description"
                style={{ margin: 0 }}
                rules={[
                  { required: true, message: t("settings.currency.nameRequired") },
                ]}
              >
                <Input
                  style={{ borderRadius: 10, height: 40, fontSize: 14 }}
                  placeholder={t("settings.currency.namePlaceholder")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6} md={6}>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                block
                htmlType="submit"
                style={{ height: 40, borderRadius: 10, fontWeight: 600 }}
                loading={addCurrencyMutation.isPending}
              >
                {t("settings.currency.addButton")}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Lista de monedas */}
      <Flex vertical gap={10}>
        {currencies.map((currency: Currency, index: number) => (
          <div
            key={currency.id}
            className="step-enter-right"
            style={{ animationDelay: `${Math.min(index, 7) * 55}ms` }}
          >
            <CurrencyCard
              currency={currency}
              defaultCurrencyId={defaultCurrency?.value}
              onSetDefault={(id) =>
                setDefaultMutation.mutate({ key: "DEFAULT_CURRENCY", value: id })
              }
              isSettingDefault={setDefaultMutation.isPending}
              onDelete={(id) => deleteCurrencyMutation.mutate(id)}
              isDeleting={deleteCurrencyMutation.isPending}
              monedasQuitar={labels.monedasQuitar}
            />
          </div>
        ))}
      </Flex>
    </Card>
  );
}
