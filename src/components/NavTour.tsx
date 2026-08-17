import { Tour } from "antd";
import type { TourProps } from "antd";
import type { TFunction } from "i18next";
import type { MutableRefObject } from "react";
import { useTranslation } from "react-i18next";
import { useMarkTourSeen } from "@/apis/hooks/useTour";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { getServiceLabels } from "@/utils/serviceLabels";
import type { UserTypeEnum } from "@/enums/UserTypeEnum";

type NavRefsMap = MutableRefObject<Record<string, HTMLButtonElement | null>>;

type NavTourProps = {
  open: boolean;
  onClose: () => void;
  navRefsMap: NavRefsMap;
};

const getTourSteps = (
  userType: UserTypeEnum | null,
  t: TFunction,
): Record<string, { title: string; description: string }> => {
  const labels = getServiceLabels(userType, t);

  return {
    servicios: {
      title: labels.tourTitle,
      description: labels.tourDescription,
    },
    presupuestos: {
      title: t("nav.budgets"),
      description: t("nav.tour.budgetsDescription"),
    },
    movimientos: {
      title: t("nav.movements"),
      description: t("nav.tour.movementsDescription"),
    },
    perfil: {
      title: t("nav.tour.profileTitle"),
      description: t("nav.tour.profileDescription"),
    },
  };
};

export default function NavTour({ open, onClose, navRefsMap }: NavTourProps) {
  const { mutate: markSeen } = useMarkTourSeen();
  const { data: currentUser } = useCurrentUser();
  const { t } = useTranslation();

  const userType = currentUser?.userType ?? null;
  const tourSteps = getTourSteps(userType, t);

  const handleClose = () => {
    markSeen();
    onClose();
  };

  // Use functions to access refs - this is the recommended pattern for Tour
  // Cast to the expected type since we know the refs will be populated when tour opens
  const steps: NonNullable<TourProps["steps"]> = [
    {
      target: () => navRefsMap.current.servicios as HTMLElement,
      ...tourSteps.servicios,
    },
    {
      target: () => navRefsMap.current.budgets as HTMLElement,
      ...tourSteps.presupuestos,
    },
    {
      target: () => navRefsMap.current.movements as HTMLElement,
      ...tourSteps.movimientos,
    },
    {
      target: () => navRefsMap.current.profile as HTMLElement,
      ...tourSteps.perfil,
    },
  ];

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
