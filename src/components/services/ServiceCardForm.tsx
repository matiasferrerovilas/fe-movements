import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  theme,
  Typography,
} from "antd";
import ApartmentOutlined from "@ant-design/icons/ApartmentOutlined";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import type { ServiceToAdd } from "@/apis/SubscriptionApi";
import { useCurrency } from "@/apis/hooks/useCurrency";
import { useUserDefault } from "@/apis/hooks/useSettings";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { getServiceLabels } from "@/utils/serviceLabels";

const { Text } = Typography;

interface CreateServiceForm {
  description: string;
  amount: number;
  currency: string;
  isPaid: boolean;
  lastPayment?: dayjs.Dayjs;
}

interface ServiceCardFormProps extends React.HTMLAttributes<HTMLElement> {
  handleAddService: (service: ServiceToAdd) => Promise<void> | void;
}

export const ServiceCardForm = ({ handleAddService }: ServiceCardFormProps) => {
  const [form] = Form.useForm<CreateServiceForm>();
  const [isPaid, setIsPaid] = useState(false);
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useCurrency();
  const { data: defaultCurrency } = useUserDefault("DEFAULT_CURRENCY");
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const { data: currentUser } = useCurrentUser();
  const { t } = useTranslation();
  const labels = getServiceLabels(currentUser?.userType ?? null, t);

  const hasNoCurrencies = !isLoadingCurrencies && currencies.length === 0;
  const handleGoToSettings = () => {
    void navigate({ to: "/settings", search: { tab: "finanzas" } });
  };

  const onFinish = (values: CreateServiceForm) => {
    const service: ServiceToAdd = {
      description: values.description,
      amount: values.amount,
      lastPayment: values.lastPayment ? values.lastPayment.toDate() : null,
      isPaid: values.isPaid,
      currency: { symbol: values.currency },
    };
    handleAddService(service);
    form.resetFields();
    setIsPaid(false);
  };
  useEffect(() => {
    const currencySymbol = currencies.find(
      (c) => c.id === defaultCurrency?.value
    )?.symbol;

    form.setFieldsValue({
      currency: currencySymbol,
      isPaid: false,
    });
  }, [defaultCurrency, currencies, form]);

  if (hasNoCurrencies) {
    return (
      <Alert
        type="warning"
        showIcon
        message={t("services.form.noCurrencyTitle")}
        description={t("services.form.noCurrencyDescription")}
        action={
          <Button
            size="small"
            type="primary"
            icon={<SettingOutlined />}
            onClick={handleGoToSettings}
          >
            {t("services.form.noCurrencyCta")}
          </Button>
        }
      />
    );
  }

  return (
    <Card
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: isPaid ? token.colorSuccessBorder : token.colorErrorBorder,
        borderWidth: 2,
      }}
      styles={{ body: { padding: 20 } }}
    >
      {/* Header */}
      <Flex align="center" justify="space-between" style={{ marginBottom: 4 }}>
        <Flex align="center" gap={10}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: token.borderRadius,
              background: isPaid ? token.colorSuccessBg : token.colorErrorBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ApartmentOutlined
              style={{
                fontSize: 18,
                color: isPaid ? token.colorSuccess : token.colorError,
              }}
            />
          </div>
          <div>
            <Text strong style={{ fontSize: 15 }}>
              {labels.nuevo}
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              {isPaid
                ? t("services.form.markedAsPaid")
                : t("services.form.pendingPayment")}
            </Text>
          </div>
        </Flex>
        {isPaid ? (
          <CheckCircleOutlined
            style={{ color: token.colorSuccess, fontSize: 22 }}
          />
        ) : (
          <CloseCircleOutlined
            style={{ color: token.colorError, fontSize: 22 }}
          />
        )}
      </Flex>

      <Divider style={{ margin: "14px 0" }} />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          isPaid: false,
          currency: currencies.find((c) => c.id === defaultCurrency?.value)
            ?.symbol,
        }}
      >
        <Row gutter={[12, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="description"
              label={t("services.form.descriptionLabel")}
              rules={[
                { required: true, message: t("services.form.descriptionRequired") },
              ]}
            >
              <Input placeholder={t("services.form.descriptionPlaceholder")} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="amount"
              label={t("services.form.amountLabel")}
              rules={[{ required: true, message: t("services.form.amountRequired") }]}
            >
              <InputNumber
                precision={2}
                style={{ width: "100%" }}
                controls={false}
                placeholder={t("services.form.amountPlaceholder")}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="currency"
              label={t("services.form.currencyLabel")}
              rules={[{ required: true, message: t("services.form.currencyRequired") }]}
            >
              <Select placeholder={t("services.form.currencyPlaceholder")}>
                {currencies.map((currency) => (
                  <Select.Option key={currency.id} value={currency.symbol}>
                    {currency.symbol}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="isPaid"
              label={t("services.form.statusLabel")}
              valuePropName="checked"
            >
              <Switch
                checkedChildren={t("services.form.statusPaidSwitch")}
                unCheckedChildren={t("services.form.statusPendingSwitch")}
                onChange={(checked) => setIsPaid(checked)}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          {isPaid && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastPayment"
                label={t("services.form.paymentDateLabel")}
                rules={[
                  {
                    required: true,
                    message: t("services.form.paymentDateRequired"),
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  disabledDate={(d) => d.isAfter(dayjs())}
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Button
          htmlType="submit"
          block
          variant="solid"
          icon={<PlusOutlined />}
          style={{
            background: isPaid ? token.colorSuccess : token.colorError,
            borderColor: isPaid ? token.colorSuccess : token.colorError,
            color: "#fff",
            transition: "background 0.4s ease, border-color 0.4s ease",
          }}
        >
          {labels.agregar}
        </Button>
      </Form>
    </Card>
  );
};
