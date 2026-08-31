import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsReadOnly } from "@/apis/workspace/useIsReadOnly";

const mockUseCurrentWorkspace = vi.fn();
vi.mock("@/apis/workspace/WorkspaceContext", () => ({
  useCurrentWorkspace: () => mockUseCurrentWorkspace(),
}));

describe("useIsReadOnly", () => {
  it("returns true when the caller's role in the active workspace is READ_ONLY", () => {
    mockUseCurrentWorkspace.mockReturnValue({
      currentWorkspace: { metadata: { role: "READ_ONLY" } },
    });

    const { result } = renderHook(() => useIsReadOnly());

    expect(result.current).toBe(true);
  });

  it("returns false for a COLLABORATOR or OWNER", () => {
    mockUseCurrentWorkspace.mockReturnValue({
      currentWorkspace: { metadata: { role: "COLLABORATOR" } },
    });

    const { result } = renderHook(() => useIsReadOnly());

    expect(result.current).toBe(false);
  });

  it("returns false when there is no active workspace yet", () => {
    mockUseCurrentWorkspace.mockReturnValue({ currentWorkspace: null });

    const { result } = renderHook(() => useIsReadOnly());

    expect(result.current).toBe(false);
  });
});
