import { Button, Tabs } from "antd";
import ModalComponent from "../Modal";
import { useRef, useState } from "react";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import ImportMovementTab from "./ImportMovementTab";
import AddMovementExpenseTab from "./AddMovementExpenseTab";

const TAB_ARCHIVO = "1";
const TAB_INDIVIDUAL = "2";

export default function AddMovementModal({ block }: { block?: boolean }) {
  const [modalOpen, setModalOpen] = useState(false);
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const [activeTab, setActiveTab] = useState<string>(TAB_ARCHIVO);

  const uploadRef = useRef<{ handleConfirm: () => void } | null>(null);
  const expenseRef = useRef<{ handleConfirm: () => void } | null>(null);

  const handleConfirm = () => {
    switch (activeTab) {
      case TAB_ARCHIVO:
        uploadRef.current?.handleConfirm();
        break;
      case TAB_INDIVIDUAL:
        expenseRef.current?.handleConfirm();
        break;
    }
  };

  const confirmLabel = activeTab === TAB_ARCHIVO ? "Importar" : "Agregar";
  const confirmIcon =
    activeTab === TAB_ARCHIVO ? <UploadOutlined /> : <PlusOutlined />;

  return (
    <>
      <Button
        type="primary"
        size="large"
        shape="round"
        block={block}
        icon={<PlusCircleOutlined />}
        onClick={() => setModalOpen(true)}
      >
        Movimiento
      </Button>
      <ModalComponent
        open={modalOpen}
        onClose={handleCloseModal}
        title="Agregar Movimiento"
        footer={
          <Button type="primary" icon={confirmIcon} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: TAB_ARCHIVO,
              label: "Archivo",
              children: (
                <ImportMovementTab ref={uploadRef} onSuccess={handleCloseModal} />
              ),
            },
            {
              key: TAB_INDIVIDUAL,
              label: "Individual",
              children: (
                <AddMovementExpenseTab
                  ref={expenseRef}
                  onSuccess={handleCloseModal}
                />
              ),
            },
          ]}
        />
      </ModalComponent>
    </>
  );
}
