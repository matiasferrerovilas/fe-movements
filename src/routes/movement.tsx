import { createFileRoute } from "@tanstack/react-router";
import { Card } from "antd";
import { useCallback, useRef, useState } from "react";
import MovementTable from "../components/movements/tables/MovementTable";
import FiltrosMovement from "../components/movements/FiltrosMovement";
import { BankEnum } from "../enums/BankEnum";
import { TypeEnum } from "../enums/TypeExpense";
import AddMovementModal from "../components/modals/movements/AddMovementModal";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";

export const Route = createFileRoute("/movement")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  component: RouteComponent,
});

export type MovementFilters = {
  description: string | null;
  type: TypeEnum[];
  bank: BankEnum[];
  categories: string[];
  isLive: boolean;
  currency: string[];
};

function RouteComponent() {
  const [filters, setFilters] = useState<MovementFilters>({
    currency: [],
    description: null,
    type: [],
    bank: [],
    categories: [],
    isLive: true,
  });

  const filtersRef = useRef(filters);

  const handleFiltersChange = useCallback((newFilters: MovementFilters) => {
    filtersRef.current = newFilters;
    setFilters(newFilters);
  }, []);

  return (
    <div style={{ paddingTop: 30 }}>
      <FiltrosMovement
        initialFilters={filters}
        onFiltersChange={handleFiltersChange}
        AddEditMovementModal={AddMovementModal}
      />
      <Card title="Movimientos" style={{ marginBottom: 16, padding: 0 }}>
        <MovementTable filters={filters} />
      </Card>
    </div>
  );
}
