import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GoalRecord } from "@/models/Goal";
import { GoalCard } from "@/components/goals/GoalCard";

const goal: GoalRecord = {
  id: 1,
  workspaceId: 10,
  name: "Viaje a Bariloche",
  targetAmount: 1000,
  currentAmount: 250,
  currency: { symbol: "ARS" },
  targetDate: null,
  progressPercent: 25,
  createdAt: "2026-01-01T00:00:00",
};

describe("GoalCard", () => {
  it("muestra el nombre, el objetivo y el monto ahorrado", () => {
    render(
      <GoalCard goal={goal} onEdit={vi.fn()} onContribute={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText("Viaje a Bariloche")).toBeInTheDocument();
    expect(screen.getByText((1000).toLocaleString("es-AR", { minimumFractionDigits: 2 }), { exact: false })).toBeInTheDocument();
    expect(screen.getByText((250).toLocaleString("es-AR", { minimumFractionDigits: 2 }), { exact: false })).toBeInTheDocument();
  });

  it("no atenúa la tarjeta cuando isPendingRemoval no está seteado", () => {
    const { container } = render(
      <GoalCard goal={goal} onEdit={vi.fn()} onContribute={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(container.querySelector('[style*="opacity: 0.45"]')).not.toBeInTheDocument();
  });

  it("atenúa la tarjeta (dimming) cuando isPendingRemoval es true", () => {
    const { container } = render(
      <GoalCard
        goal={goal}
        onEdit={vi.fn()}
        onContribute={vi.fn()}
        onDelete={vi.fn()}
        isPendingRemoval
      />,
    );

    expect(container.querySelector('[style*="opacity: 0.45"]')).toBeInTheDocument();
  });

  it("el diálogo de confirmación ya no afirma que la acción no se puede deshacer", async () => {
    const user = userEvent.setup();
    render(
      <GoalCard goal={goal} onEdit={vi.fn()} onContribute={vi.fn()} onDelete={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /Eliminar meta/i }));

    expect(
      await screen.findByText("Vas a poder deshacer esta acción durante los próximos segundos."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Esta acción no se puede deshacer.")).not.toBeInTheDocument();
  });

  it("llama a onDelete con el id de la meta al confirmar el borrado", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <GoalCard goal={goal} onEdit={vi.fn()} onContribute={vi.fn()} onDelete={onDelete} />,
    );

    await user.click(screen.getByRole("button", { name: /Eliminar meta/i }));
    await user.click(await screen.findByRole("button", { name: "Eliminar" }));

    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
