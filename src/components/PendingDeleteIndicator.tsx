import { Spin } from "antd";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";

/**
 * Overlay chico que se muestra sobre un ítem durante la ventana de "deshacer" borrado
 * (useUndoableDelete). Sin esto, el ítem atenuado/gris no comunica que hay algo en curso —
 * parece trabado y tienta a un segundo click. El contenedor debe tener `position: relative`.
 */
export default function PendingDeleteIndicator() {
  return (
    <Spin
      size="small"
      indicator={<LoadingOutlined spin />}
      style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}
    />
  );
}
