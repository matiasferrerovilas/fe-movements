import { Button } from "antd";
import ModalComponent from "../Modal";
import { useRef, useState } from "react";
import AddMovementExpenseTab from "./AddMovementExpenseTab";
import { EditOutlined } from "@ant-design/icons";
import type { Movement } from "../../../models/Movement";

interface EditMovementModalProps {
  movement: Movement;
}

export default function EditMovementModal({
  movement,
}: EditMovementModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const handleCloseModal = () => {
    setModalOpen(false);
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
        title="Editar el movimiento"
      />

      <ModalComponent
        open={modalOpen}
        onClose={handleCloseModal}
        title="Editar Movimiento"
        footer={
          <Button type="primary" onClick={handleConfirm}>
            Guardar
          </Button>
        }
      >
        <AddMovementExpenseTab
          ref={updateRef}
          onSuccess={handleCloseModal}
          movementToEdit={movement}
        />
      </ModalComponent>
    </>
  );
}
