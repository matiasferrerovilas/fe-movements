import type React from "react";
import type { Movement } from "../../../models/Movement";

export interface FormattedMovement extends Movement {
  formattedDate: string;
  currencySymbol: React.ReactNode;
  installments: string;
  isDebit: boolean;
  amountColor: string;
  amountSign: string;
}

export interface MovementTableViewProps {
  movements: FormattedMovement[];
  onDelete: (id: number) => void;
  getCardStyle: (record: FormattedMovement) => React.CSSProperties;
}
