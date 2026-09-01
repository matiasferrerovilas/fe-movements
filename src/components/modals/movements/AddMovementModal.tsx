import { Alert, Button, Tabs } from "antd";
import ModalComponent from "@/components/modals/Modal";
import { useRef, useState, type ReactNode } from "react";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import ImportMovementTab from "@/components/modals/movements/ImportMovementTab";
import AddMovementExpenseTab from "@/components/modals/movements/AddMovementExpenseTab";
import { useBanks } from "@/apis/hooks/useBank";
import { useCurrency } from "@/apis/hooks/useCurrency";
import { useIsReadOnly } from "@/apis/workspace/useIsReadOnly";

const TAB_INDIVIDUAL = "1";
const TAB_ARCHIVO = "2";

// Desactivado a pedido del usuario: el import de PDF quedó desactualizado y no anda bien — se
// oculta la pestaña en vez de borrar el código, para poder reactivarlo con un solo flip acá
// cuando esté listo. Item relacionado en el roadmap: "Import de PDF sin validar tipo ni tamaño".
const PDF_IMPORT_ENABLED = false;

interface AddMovementModalProps {
  block?: boolean;
  /** Reemplaza el botón trigger por defecto — recibe el onClick que abre el modal. */
  trigger?: (onClick: () => void) => ReactNode;
}

export default function AddMovementModal({ block, trigger }: AddMovementModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isReadOnly = useIsReadOnly();
  const { data: banks = [], isLoading: isLoadingBanks } = useBanks();
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useCurrency();
  const isLoadingSetup = isLoadingBanks || isLoadingCurrencies;
  const hasNoBanks = !isLoadingSetup && banks.length === 0;
  const hasNoCurrencies = !isLoadingSetup && currencies.length === 0;
  const hasMissingSetup = hasNoBanks || hasNoCurrencies;
  const [modalOpen, setModalOpen] = useState(false);
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleGoToSettings = () => {
    handleCloseModal();
    void navigate({ to: "/settings", search: { tab: "finanzas" } });
  };
  const [activeTab, setActiveTab] = useState<string>(TAB_INDIVIDUAL);

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

  const confirmLabel =
    activeTab === TAB_ARCHIVO
      ? t("movements.modal.confirmImport")
      : t("movements.modal.confirmAdd");
  const confirmIcon =
    activeTab === TAB_ARCHIVO ? <UploadOutlined /> : <PlusOutlined />;

  // Un READ_ONLY no tiene ninguna acción de crear disponible — ni el botón trigger por defecto
  // ni el custom (si alguien lo pasa igual, no se invoca).
  if (isReadOnly) {
    return null;
  }

  return (
    <>
      {trigger ? (
        trigger(() => setModalOpen(true))
      ) : (
        <Button
          type="primary"
          size="large"
          shape="round"
          block={block}
          icon={<PlusCircleOutlined />}
          onClick={() => setModalOpen(true)}
        >
          {t("movements.modal.movementButton")}
        </Button>
      )}
      <ModalComponent
        open={modalOpen}
        onClose={handleCloseModal}
        title={t("movements.modal.addTitle")}
        footer={
          hasMissingSetup ? null : (
            <Button type="primary" icon={confirmIcon} onClick={handleConfirm}>
              {confirmLabel}
            </Button>
          )
        }
      >
        {hasMissingSetup ? (
          <Alert
            type="warning"
            showIcon
            title={
              hasNoBanks
                ? t("movements.modal.noBankTitle")
                : t("movements.modal.noCurrencyTitle")
            }
            description={
              hasNoBanks
                ? t("movements.modal.noBankDescription")
                : t("movements.modal.noCurrencyDescription")
            }
            action={
              <Button
                size="small"
                type="primary"
                icon={<SettingOutlined />}
                onClick={handleGoToSettings}
              >
                {t("movements.modal.noBankCta")}
              </Button>
            }
          />
        ) : PDF_IMPORT_ENABLED ? (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: TAB_INDIVIDUAL,
                label: t("movements.modal.tabManual"),
                children: (
                  <AddMovementExpenseTab
                    ref={expenseRef}
                    onSuccess={handleCloseModal}
                  />
                ),
              },
              {
                key: TAB_ARCHIVO,
                label: t("movements.modal.tabImportPdf"),
                children: (
                  <ImportMovementTab ref={uploadRef} onSuccess={handleCloseModal} />
                ),
              },
            ]}
          />
        ) : (
          // Con el import de PDF desactivado, no queda más que una forma de cargar un
          // movimiento — se salta el wrapper de Tabs en vez de mostrar una sola pestaña sola.
          <AddMovementExpenseTab ref={expenseRef} onSuccess={handleCloseModal} />
        )}
      </ModalComponent>
    </>
  );
}
