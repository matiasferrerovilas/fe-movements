import { Tour } from "antd";
import type { TourProps } from "antd";
import { useMemo } from "react";
import { useMarkTourSeen } from "../apis/hooks/useTour";

type NavRefs = {
  balance: HTMLButtonElement | null;
  servicios: HTMLButtonElement | null;
  presupuestos: HTMLButtonElement | null;
  gastos: HTMLButtonElement | null;
  ajustes: HTMLButtonElement | null;
  admin?: HTMLButtonElement | null;
};

type NavTourProps = {
  open: boolean;
  onClose: () => void;
  refs: NavRefs;
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

export default function NavTour({ open, onClose, refs }: NavTourProps) {
  const { mutate: markSeen } = useMarkTourSeen();

  const handleClose = () => {
    markSeen();
    onClose();
  };

  const steps = useMemo((): TourProps["steps"] => {
    const baseSteps: NonNullable<TourProps["steps"]> = [
      { target: refs.balance, ...TOUR_STEPS.balance },
      { target: refs.servicios, ...TOUR_STEPS.servicios },
      { target: refs.presupuestos, ...TOUR_STEPS.presupuestos },
      { target: refs.gastos, ...TOUR_STEPS.gastos },
      { target: refs.ajustes, ...TOUR_STEPS.ajustes },
    ];

    if (refs.admin) {
      baseSteps.push({ target: refs.admin, ...TOUR_STEPS.admin });
    }

    return baseSteps;
  }, [refs]);

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
