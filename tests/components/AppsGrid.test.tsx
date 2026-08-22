import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppsGrid } from "@/components/AppsGrid";

vi.mock("@/apis/hooks/useUserRoles", () => ({
  useUserRoles: vi.fn(),
}));

import { useUserRoles } from "@/apis/hooks/useUserRoles";

function mockRoles(hasAnyRole: (...roles: string[]) => boolean) {
  vi.mocked(useUserRoles).mockReturnValue({
    hasAnyRole,
    roles: [],
  } as unknown as ReturnType<typeof useUserRoles>);
}

describe("AppsGrid", () => {
  it("muestra el link a Keep para un usuario FAMILY", () => {
    mockRoles((...roles) => roles.includes("FAMILY"));
    render(<AppsGrid />);

    expect(screen.getByText("Keep")).toBeInTheDocument();
  });

  it("muestra el link a Keep para un usuario ADMIN", () => {
    mockRoles((...roles) => roles.includes("ADMIN"));
    render(<AppsGrid />);

    expect(screen.getByText("Keep")).toBeInTheDocument();
  });

  it("no muestra el link a Keep para un usuario GUEST", () => {
    mockRoles(() => false);
    const { container } = render(<AppsGrid />);

    expect(screen.queryByText("Keep")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
