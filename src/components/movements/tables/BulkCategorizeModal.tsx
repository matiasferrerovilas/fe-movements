import { useState } from "react";
import { Button, Flex, Select } from "antd";
import { useTranslation } from "react-i18next";
import ModalComponent from "@/components/modals/Modal";
import { useCategory } from "@/apis/hooks/useCategory";
import { MAX_MOVEMENT_CATEGORIES } from "@/models/Movement";

interface BulkCategorizeModalProps {
  open: boolean;
  count: number;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (categories: string[]) => void;
}

export default function BulkCategorizeModal({
  open,
  count,
  isSubmitting,
  onClose,
  onConfirm,
}: BulkCategorizeModalProps) {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategory();
  const [selected, setSelected] = useState<string[]>([]);

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  const handleConfirm = () => {
    if (selected.length === 0) return;
    onConfirm(selected);
  };

  return (
    <ModalComponent
      open={open}
      onClose={handleClose}
      title={t("movements.bulk.categorizeTitle", { count })}
      width={420}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={handleClose}>{t("movements.bulk.cancel")}</Button>
          <Button
            type="primary"
            disabled={selected.length === 0}
            loading={isSubmitting}
            onClick={handleConfirm}
          >
            {t("movements.bulk.categorizeConfirm")}
          </Button>
        </Flex>
      }
    >
      <Select
        mode="multiple"
        style={{ width: "100%", marginTop: 8 }}
        placeholder={t("movements.bulk.categorizePlaceholder")}
        maxCount={MAX_MOVEMENT_CATEGORIES}
        value={selected}
        onChange={setSelected}
        options={categories.map((c) => ({ label: c.description, value: c.description }))}
      />
    </ModalComponent>
  );
}
