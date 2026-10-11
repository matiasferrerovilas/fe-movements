import { Modal } from "antd";
import type { ReactNode } from "react";

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  /** En false no se puede cerrar (X, máscara ni Esc), p. ej. mientras corre una operación. */
  closable?: boolean;
}

export default function ModalComponent({
  open,
  onClose,
  title,
  children,
  footer,
  width = 600,
  closable = true,
}: AppModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      closable={closable}
      mask={{ closable }}
      keyboard={closable}
      footer={footer}
      width={width}
      destroyOnHidden
      centered
    >
      {children}
    </Modal>
  );
}
