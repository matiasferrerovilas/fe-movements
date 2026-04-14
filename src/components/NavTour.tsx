import { Tour } from "antd";
import type { TourProps } from "antd";
import type { MutableRefObject } from "react";
import { useMarkTourSeen } from "../apis/hooks/useTour";

type NavRefsMap = MutableRefObject<Record<string, HTMLButtonElement | null>>;

type NavTourProps = {
  open: boolean;
  onClose: () => void;
  navRefsMap: NavRefsMap;
  hasAdmin: boolean;
};

const TOUR_STEPS: Record<string, { title: string; description: string }> = {
  balance: {
    title: "Balance",
    description:
      "Visualiza el resumen de tus ingresos y gastos. Gráficos por categoría, grupo y evolución mensual.",
  },
  servicios: {
    title: "Servicios",
    description:
      "Gestiona tus suscripciones y servicios recurrentes. Lleva control de pagos mensuales.",
  },
  presupuestos: {
    title: "Presupuestos",
    description:
      "Define presupuestos mensuales por categoría y monitorea tu progreso de gastos.",
  },
  gastos: {
    title: "Gastos",
    description:
      "Registra y consulta todos tus movimientos. Filtra por tipo, banco, categoría y más.",
  },
  ajustes: {
    title: "Ajustes",
    description:
      "Configura tu cuenta, moneda por defecto, categorías, bancos y administra tus grupos.",
  },
  admin: {
    title: "Administración",
    description:
      "Panel de administración del sistema. Gestión avanzada de usuarios y configuración.",
  },
};

export default function NavTour({ open, onClose, navRefsMap, hasAdmin }: NavTourProps) {
  const { mutate: markSeen } = useMarkTourSeen();

  const handleClose = () => {
    markSeen();
    onClose();
  };

  // Use functions to access refs - this is the recommended pattern for Tour
  // Cast to the expected type since we know the refs will be populated when tour opens
  const steps: NonNullable<TourProps["steps"]> = [
    { target: () => navRefsMap.current.balance as HTMLElement, ...TOUR_STEPS.balance },
    { target: () => navRefsMap.current.servicios as HTMLElement, ...TOUR_STEPS.servicios },
    { target: () => navRefsMap.current.budgets as HTMLElement, ...TOUR_STEPS.presupuestos },
    { target: () => navRefsMap.current.expenses as HTMLElement, ...TOUR_STEPS.gastos },
    { target: () => navRefsMap.current.settings as HTMLElement, ...TOUR_STEPS.ajustes },
  ];

  if (hasAdmin) {
    steps.push({ target: () => navRefsMap.current.admin as HTMLElement, ...TOUR_STEPS.admin });
  }

  return (
    <Tour
      open={open}
      onClose={handleClose}
      onFinish={handleClose}
      steps={steps}
      indicatorsRender={(current, total) => (
        <span>
          {current + 1} / {total}
        </span>
      )}
    />
  );
}
