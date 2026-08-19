import PlusOutlined from "@ant-design/icons/PlusOutlined";
import TagOutlined from "@ant-design/icons/TagOutlined";
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
  Tag,
  Typography,
  theme,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { OnboardingForm } from "@/apis/onboarding/OnboardingApi";
import { getEntityLabels } from "@/utils/entityLabels";

const { Text } = Typography;

interface Props {
  initialValues: Partial<OnboardingForm>;
  onNext: (values: { categoriesToAdd: string[] }) => void;
  onPrev: () => void;
}

export default function CategoryOnboarding({ initialValues, onNext, onPrev }: Props) {
  const { token } = theme.useToken();
  const [form] = Form.useForm<{ description: string }>();
  const [categories, setCategories] = useState<string[]>(
    initialValues.categoriesToAdd ?? [],
  );
  const { t } = useTranslation();
  const labels = getEntityLabels(initialValues.userType ?? null, t);

  const handleAdd = () => {
    form.validateFields().then(({ description }) => {
      const trimmed = description.trim();
      if (!trimmed || categories.includes(trimmed.toUpperCase())) return;
      setCategories((prev) => [...prev, trimmed.toUpperCase()]);
      form.resetFields();
    }).catch(() => {});
  };

  const handleRemove = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
  };

  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text type="secondary" style={{ display: "block" }}>
          {labels.categoriasOnboarding}
        </Text>
        <Text type="secondary" style={{ display: "block" }}>
          {t("onboarding.category.alreadyDefault")}
        </Text>
      </div>

      <Form form={form} layout="vertical" onFinish={handleAdd}>
        <Row gutter={[12, 0]} align="middle">
          <Col flex="auto">
            <Form.Item
              name="description"
              style={{ margin: 0 }}
              rules={[
                {
                  required: true,
                  message: t("onboarding.category.nameRequired"),
                },
                {
                  validator: (_, value) => {
                    if (!value || !value.trim()) return Promise.resolve();
                    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
                      return Promise.reject(
                        new Error(t("onboarding.category.onlyLettersError")),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder={labels.categoriaPlaceholder}
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
              {t("onboarding.category.addButton")}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Lista de categorías agregadas */}
      <div
        style={{
          minHeight: 80,
          padding: "12px 14px",
          borderRadius: 12,
          border: `1.5px dashed ${token.colorBorderSecondary}`,
          background: token.colorFillAlter,
        }}
      >
        {categories.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("onboarding.category.emptyDescription")}
              </Text>
            }
            style={{ margin: "8px 0" }}
          />
        ) : (
          <Flex wrap gap={8}>
            {categories.map((cat) => (
              <Tag
                key={cat}
                closeIcon={
                  <DeleteOutlined
                    aria-label={t("onboarding.category.removeAriaLabel", {
                      name: cat,
                    })}
                  />
                }
                onClose={() => handleRemove(cat)}
                icon={<TagOutlined />}
                color="blue"
                style={{ fontSize: 13, padding: "4px 10px", borderRadius: 8 }}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </Tag>
            ))}
          </Flex>
        )}
      </div>

      <Text
        type="secondary"
        style={{ fontSize: 12, display: "block", textAlign: "center" }}
      >
        {t("onboarding.category.footerNote")}
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
            onClick={() => onNext({ categoriesToAdd: categories })}
          >
            {t("onboarding.nextButton")}
          </Button>
        </Col>
      </Row>
    </Space>
  );
}
