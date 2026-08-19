import PlusOutlined from "@ant-design/icons/PlusOutlined";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import {
  Button,
  Col,
  Empty,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { OnboardingCurrencyEntry, OnboardingForm } from "@/apis/onboarding/OnboardingApi";
import { getEntityLabels } from "@/utils/entityLabels";

const { Text } = Typography;

interface Props {
  initialValues: Partial<OnboardingForm>;
  onNext: (values: Pick<OnboardingForm, "currenciesToAdd">) => void;
  onPrev: () => void;
}

interface CurrencyFormValues {
  symbol: string;
  description: string;
}

export default function CurrencyOnboarding({ initialValues, onNext, onPrev }: Props) {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [form] = Form.useForm<CurrencyFormValues>();
  const [currencies, setCurrencies] = useState<OnboardingCurrencyEntry[]>(
    initialValues.currenciesToAdd ?? [],
  );
  const labels = getEntityLabels(initialValues.userType ?? null, t);

  const handleAdd = () => {
    form.validateFields().then(({ symbol, description }) => {
      const trimmedSymbol = symbol.trim().toUpperCase();
      const trimmedDescription = description.trim();
      if (!trimmedSymbol || !trimmedDescription) return;
      if (currencies.some((c) => c.symbol === trimmedSymbol)) return;
      setCurrencies((prev) => [
        ...prev,
        { symbol: trimmedSymbol, description: trimmedDescription },
      ]);
      form.resetFields();
    }).catch(() => {});
  };

  const handleRemove = (symbol: string) => {
    setCurrencies((prev) => prev.filter((c) => c.symbol !== symbol));
  };

  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          {labels.monedasSubtitle}
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          {t("onboarding.currency.description2")}
        </Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleAdd}>
        <Row gutter={[12, 0]} align="middle">
          <Col xs={8} sm={6}>
            <Form.Item
              name="symbol"
              style={{ margin: 0 }}
              rules={[
                { required: true, message: t("onboarding.currency.symbolRequired") },
              ]}
            >
              <Input
                placeholder={t("onboarding.currency.symbolPlaceholder")}
                style={{ borderRadius: 10, height: 40 }}
                maxLength={10}
              />
            </Form.Item>
          </Col>
          <Col flex="auto">
            <Form.Item
              name="description"
              style={{ margin: 0 }}
              rules={[
                { required: true, message: t("onboarding.currency.nameRequired") },
              ]}
            >
              <Input
                placeholder={t("onboarding.currency.namePlaceholder")}
                style={{ borderRadius: 10, height: 40 }}
              />
            </Form.Item>
          </Col>
          <Col>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              htmlType="submit"
              style={{ height: 40, borderRadius: 10, fontWeight: 600 }}
            >
              {t("onboarding.currency.addButton")}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Lista de monedas agregadas */}
      <div
        style={{
          minHeight: 80,
          padding: "12px 14px",
          borderRadius: 12,
          border: `1.5px dashed ${token.colorBorderSecondary}`,
          background: token.colorFillAlter,
        }}
      >
        {currencies.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("onboarding.currency.emptyDescription")}
              </Text>
            }
            style={{ margin: "8px 0" }}
          />
        ) : (
          <Flex vertical gap={8}>
            {currencies.map((currency) => (
              <div
                key={currency.symbol}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: `1.5px solid ${token.colorBorderSecondary}`,
                  background: token.colorBgContainer,
                }}
              >
                <Flex align="center" gap={10}>
                  <DollarOutlined
                    style={{ color: token.colorTextSecondary, fontSize: 16 }}
                  />
                  <Text strong style={{ fontSize: 14 }}>
                    {currency.symbol}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {currency.description}
                  </Text>
                </Flex>
                <Tooltip title={t("onboarding.currency.deleteTooltip")}>
                  <Button
                    type="text"
                    size="small"
                    danger
                    aria-label={t("onboarding.currency.deleteAriaLabel", {
                      name: currency.symbol,
                    })}
                    onClick={() => handleRemove(currency.symbol)}
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </div>
            ))}
          </Flex>
        )}
      </div>

      <Text
        type="secondary"
        style={{ fontSize: 12, display: "block", textAlign: "center" }}
      >
        {t("onboarding.currency.footerNote")}
      </Text>

      <Row gutter={[16, 10]}>
        <Col xs={12}>
          <Button block type="default" onClick={onPrev}>
            {t("onboarding.backButton")}
          </Button>
        </Col>
        <Col xs={12}>
          <Button
            block
            color="geekblue"
            variant="filled"
            onClick={() => onNext({ currenciesToAdd: currencies })}
          >
            {t("onboarding.nextButton")}
          </Button>
        </Col>
      </Row>
    </Space>
  );
}
