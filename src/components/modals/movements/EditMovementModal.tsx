import { Button } from "antd";
import ModalComponent from "@/components/modals/Modal";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import AddMovementExpenseTab from "@/components/modals/movements/AddMovementExpenseTab";
import EditOutlined from "@ant-design/icons/EditOutlined";
import type { Movement } from "@/models/Movement";

interface EditMovementModalProps {
  movement: Movement;
}

export default function EditMovementModal({
  movement,
}: EditMovementModalProps) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const handleCloseModal = () => {
    setModalOpen(false);
    setIsSaving(false);
  };

  const updateRef = useRef<{ handleConfirm: () => void } | null>(null);

  const handleConfirm = () => {
    updateRef.current?.handleConfirm();
  };
  return (
    <>
      <Button
        type="text"
        onClick={() => setModalOpen(true)}
        icon={
          <EditOutlined
            style={{
              fontSize: 20,
              cursor: "pointer",
              marginRight: 8,
            }}
          />
        }
        style={{
          color: "gray",
          borderRadius: 8,
          padding: "4px 8px",
          fontSize: 18,
        }}
        title={t("movements.modal.editTooltip")}
        aria-label={t("movements.modal.editTooltip")}
      />

      <ModalComponent
        open={modalOpen}
        onClose={handleCloseModal}
        closable={!isSaving}
        title={t("movements.modal.editTitle")}
        footer={
          <Button type="primary" onClick={handleConfirm} loading={isSaving}>
            {t("movements.modal.saveButton")}
          </Button>
        }
      >
        <AddMovementExpenseTab
          ref={updateRef}
          onSuccess={handleCloseModal}
          onPendingChange={setIsSaving}
          movementToEdit={movement}
        />
      </ModalComponent>
    </>
  );
}
