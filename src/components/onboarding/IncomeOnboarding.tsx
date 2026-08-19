import {
  Button,
  Col,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import { useTranslation } from "react-i18next";
import type { OnboardingBankEntry, OnboardingCurrencyEntry, OnboardingForm, OnboardingIngresoForm } from "@/apis/onboarding/OnboardingApi";
import { getEntityLabels } from "@/utils/entityLabels";
import { WorkspaceEnum } from "@/enums/WorkspaceEnum";

const { Text } = Typography;

interface Props {
  initialValues: Partial<OnboardingForm>;
  onFinish: (values: OnboardingIngresoForm) => void;
  onPrev: () => void;
  isLoading?: boolean;
}

export default function IncomeOnboarding({
  initialValues,
  onFinish,
  onPrev,
  isLoading,
}: Props) {
  const [form] = Form.useForm<OnboardingIngresoForm>();
  const { t } = useTranslation();
  const labels = getEntityLabels(initialValues.userType ?? null, t);

  // Usamos los bancos y monedas ingresados en los pasos anteriores (si los hay)
  const banksToAdd: OnboardingBankEntry[] = initialValues.banksToAdd ?? [];
  const currenciesToAdd: OnboardingCurrencyEntry[] = initialValues.currenciesToAdd ?? [];
  const accountsToAddOptions: string[] = (initialValues.accountsToAdd || []).filter(
    (g: string) => g && g.trim(),
  );

  // Default bank pre-seleccionado si hay uno marcado como default
  const defaultBank = banksToAdd.find((b) => b.isDefault)?.description;

  // Finalizar: envía los valores actuales sin requerir ningún campo
  const handleSubmit = () => {
    onFinish(form.getFieldsValue());
  };

  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          {labels.ingresoOnboardingDescription}
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ ...initialValues, bank: defaultBank }}
      >
        <Row gutter={[0, 0]}>
          <Col xs={24}>
            <Form.Item
              name="bank"
              label={<Text strong>{t("onboarding.income.bankLabel")}</Text>}
            >
              <Select placeholder={t("onboarding.income.bankPlaceholder")}>
                {banksToAdd.length > 0
                  ? banksToAdd.map((bank) => (
                      <Select.Option key={bank.description} value={bank.description}>
                        {bank.description.charAt(0) + bank.description.slice(1).toLowerCase()}
                      </Select.Option>
                    ))
                  : null}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="currency"
              label={<Text strong>{t("onboarding.income.currencyLabel")}</Text>}
            >
              <Select placeholder={t("onboarding.income.currencyPlaceholder")}>
                {currenciesToAdd.map((currency) => (
                  <Select.Option key={currency.symbol} value={currency.symbol}>
                    {currency.symbol} — {currency.description}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="amount"
              label={<Text strong>{labels.ingresoAmountLabel}</Text>}
            >
              <InputNumber
                precision={2}
                placeholder="50000"
                prefix={<DollarOutlined />}
                style={{ width: "100%" }}
                controls={false}
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="accountToAdd"
              label={<Text strong>{labels.workspace}</Text>}
              initialValue={
                accountsToAddOptions.length > 0 ? undefined : WorkspaceEnum.DEFAULT
              }
            >
              {accountsToAddOptions.length > 0 ? (
                <Select
                  placeholder={t("onboarding.income.workspacePlaceholder")}
                  options={accountsToAddOptions.map((g) => ({ label: g, value: g }))}
                />
              ) : (
                <Select
                  disabled
                  options={[
                    {
                      value: WorkspaceEnum.DEFAULT,
                      label: t("onboarding.income.workspaceDefaultOption", {
                        workspace: labels.workspaceSingular,
                      }),
                    },
                  ]}
                />
              )}
            </Form.Item>
          </Col>
        </Row>

        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12, textAlign: "center" }}>
          {t("onboarding.income.footerNote")}
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
              onClick={handleSubmit}
              loading={isLoading}
            >
              {t("onboarding.income.finishButton")}
            </Button>
          </Col>
        </Row>
      </Form>
    </Space>
  );
}
