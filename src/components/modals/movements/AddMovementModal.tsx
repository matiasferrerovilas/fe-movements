import { Button, Tabs } from "antd";
import ModalComponent from "../Modal";
import { useRef, useState } from "react";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import ImportMovementTab from "./ImportMovementTab";
import ImportMovementExcelTab from "./ImportMovementExcelTab";
import AddMovementExpenseTab from "./AddMovementExpenseTab";

const TAB_INDIVIDUAL = "1";
const TAB_PDF = "2";
const TAB_EXCEL = "3";

export default function AddMovementModal({ block }: { block?: boolean }) {
  const [modalOpen, setModalOpen] = useState(false);
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const [activeTab, setActiveTab] = useState<string>(TAB_INDIVIDUAL);

  const pdfRef = useRef<{ handleConfirm: () => void } | null>(null);
  const excelRef = useRef<{ handleConfirm: () => void } | null>(null);
  const expenseRef = useRef<{ handleConfirm: () => void } | null>(null);

  const handleConfirm = () => {
    switch (activeTab) {
      case TAB_PDF:
        pdfRef.current?.handleConfirm();
        break;
      case TAB_EXCEL:
        excelRef.current?.handleConfirm();
        break;
      case TAB_INDIVIDUAL:
        expenseRef.current?.handleConfirm();
        break;
    }
  };

  const confirmLabel =
    activeTab === TAB_PDF || activeTab === TAB_EXCEL ? "Importar" : "Agregar";
  const confirmIcon =
    activeTab === TAB_PDF || activeTab === TAB_EXCEL ? (
      <UploadOutlined />
    ) : (
      <PlusOutlined />
    );

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
              key: TAB_INDIVIDUAL,
              label: "Manual",
              children: (
                <AddMovementExpenseTab
                  ref={expenseRef}
                  onSuccess={handleCloseModal}
                />
              ),
            },
            {
              key: TAB_PDF,
              label: "Importar PDF",
              children: (
                <ImportMovementTab ref={pdfRef} onSuccess={handleCloseModal} />
              ),
            },
            {
              key: TAB_EXCEL,
              label: "Importar Excel/CSV",
              children: (
                <ImportMovementExcelTab
                  ref={excelRef}
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
