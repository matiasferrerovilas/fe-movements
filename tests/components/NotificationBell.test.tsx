import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigProvider } from "antd";
import { NotificationSeverity, type AppNotificationEntry } from "@/models/AppNotification";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/apis/hooks/useNotifications", () => ({
  useNotifications: vi.fn(),
  useMarkNotificationsRead: vi.fn(),
}));

import { useMarkNotificationsRead, useNotifications } from "@/apis/hooks/useNotifications";
import NotificationBell from "@/components/NotificationBell";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeEntry(overrides?: Partial<AppNotificationEntry>): AppNotificationEntry {
  return {
    id: "n1",
    title: "Presupuesto superado",
    message: "Superaste el presupuesto de Comida",
    severity: NotificationSeverity.WARNING,
    createdAt: "2026-08-15T10:00:00",
    read: false,
    ...overrides,
  };
}

function renderBell() {
  return render(
    <ConfigProvider>
      <NotificationBell />
    </ConfigProvider>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("NotificationBell", () => {
  const markAllRead = vi.fn();

  beforeEach(() => {
    vi.mocked(useMarkNotificationsRead).mockReturnValue(markAllRead);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not show a badge when there are no unread notifications", () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useNotifications>);

    renderBell();

    expect(document.querySelector(".ant-scroll-number")).not.toBeInTheDocument();
  });

  it("shows the unread count as a badge", () => {
    vi.mocked(useNotifications).mockReturnValue({
      data: [makeEntry({ id: "n1", read: false }), makeEntry({ id: "n2", read: true })],
    } as unknown as ReturnType<typeof useNotifications>);

    renderBell();

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows notification titles when opened", async () => {
    const user = userEvent.setup();
    vi.mocked(useNotifications).mockReturnValue({
      data: [makeEntry({ id: "n1", title: "Alquiler impago" })],
    } as unknown as ReturnType<typeof useNotifications>);

    renderBell();

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Alquiler impago")).toBeInTheDocument();
    });
  });

  it("shows an empty state when there are no notifications", async () => {
    const user = userEvent.setup();
    vi.mocked(useNotifications).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useNotifications>);

    renderBell();

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Sin notificaciones")).toBeInTheDocument();
    });
  });

  it("marks notifications as read when opened with unread items", async () => {
    const user = userEvent.setup();
    vi.mocked(useNotifications).mockReturnValue({
      data: [makeEntry({ id: "n1", read: false })],
    } as unknown as ReturnType<typeof useNotifications>);

    renderBell();

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(markAllRead).toHaveBeenCalledTimes(1);
    });
  });

  it("does not call markAllRead when opened with no unread items", async () => {
    const user = userEvent.setup();
    vi.mocked(useNotifications).mockReturnValue({
      data: [makeEntry({ id: "n1", read: true })],
    } as unknown as ReturnType<typeof useNotifications>);

    renderBell();

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Presupuesto superado")).toBeInTheDocument();
    });
    expect(markAllRead).not.toHaveBeenCalled();
  });
});
