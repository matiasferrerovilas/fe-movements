import { Button, Popconfirm } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { useTranslation } from "react-i18next";
import type { FormattedMovement } from "@/components/movements/tables/types";
import EditMovementModal from "@/components/modals/movements/EditMovementModal";

interface MovementActionButtonsProps {
  record: FormattedMovement;
  onDelete: (id: number) => void;
}

export default function MovementActionButtons({
  record,
  onDelete,
}: MovementActionButtonsProps) {
  const { t } = useTranslation();
  return (
    <>
      <Popconfirm
        title={t("movements.deleteConfirmTitle")}
        onConfirm={() => onDelete(record.id)}
        okText={t("movements.yes")}
        cancelText={t("movements.no")}
        placement="topRight"
      >
        <Button
          type="text"
          icon={
            <DeleteOutlined
              style={{ fontSize: 20, cursor: "pointer", marginRight: 8 }}
            />
          }
          style={{
            color: "gray",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 18,
          }}
          title={t("movements.deleteTooltip")}
          aria-label={t("movements.deleteTooltip")}
        />
      </Popconfirm>
      <EditMovementModal movement={record} />
    </>
  );
}
