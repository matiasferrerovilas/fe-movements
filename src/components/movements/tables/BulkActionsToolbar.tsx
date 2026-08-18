import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import TagsOutlined from "@ant-design/icons/TagsOutlined";
import { App, Button, Card, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

interface BulkActionsToolbarProps {
  selectedCount: number;
  isDeleting?: boolean;
  onBulkDelete: () => void;
  onOpenCategorize: () => void;
  onClearSelection: () => void;
}

export default function BulkActionsToolbar({
  selectedCount,
  isDeleting,
  onBulkDelete,
  onOpenCategorize,
  onClearSelection,
}: BulkActionsToolbarProps) {
  const { t } = useTranslation();
  const { modal } = App.useApp();

  if (selectedCount === 0) return null;

  const handleDeleteClick = () => {
    modal.confirm({
      title: t("movements.bulk.deleteConfirmTitle", { count: selectedCount }),
      content: t("movements.bulk.deleteConfirmDescription"),
      okText: t("movements.bulk.deleteConfirmOk"),
      okButtonProps: { danger: true },
      cancelText: t("movements.bulk.cancel"),
      onOk: onBulkDelete,
    });
  };

  return (
    <Card
      size="small"
      className="fade-in-up"
      style={{ marginBottom: 8, borderRadius: 6 }}
      styles={{ body: { padding: "8px 16px" } }}
    >
      <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
        <Text strong>{t("movements.bulk.selectedCount", { count: selectedCount })}</Text>
        <Flex gap={8} wrap="wrap">
          <Button icon={<TagsOutlined />} onClick={onOpenCategorize}>
            {t("movements.bulk.categorizeButton")}
          </Button>
          <Button danger icon={<DeleteOutlined />} loading={isDeleting} onClick={handleDeleteClick}>
            {t("movements.bulk.deleteButton")}
          </Button>
          <Button type="text" onClick={onClearSelection}>
            {t("movements.bulk.clearSelection")}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
