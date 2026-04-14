import { Button, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { FormattedMovement } from "./types";
import EditMovementModal from "../../modals/movements/EditMovementModal";

interface MovementActionButtonsProps {
  record: FormattedMovement;
  onDelete: (id: number) => void;
}

export default function MovementActionButtons({
  record,
  onDelete,
}: MovementActionButtonsProps) {
  return (
    <>
      <Popconfirm
        title="¿Estás seguro de que quieres eliminar el movimiento?"
        onConfirm={() => onDelete(record.id)}
        okText="Sí"
        cancelText="No"
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
          title="Eliminar el movimiento"
        />
      </Popconfirm>
      <EditMovementModal movement={record} />
    </>
  );
}
