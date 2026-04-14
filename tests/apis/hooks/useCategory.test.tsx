import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Category } from "../../../src/models/Category";
import {
  useCategory,
  useAddCategory,
  useDeleteCategory,
  useMigrateCategory,
} from "../../../src/apis/hooks/useCategory";

// ── MSW server ─────────────────────────────────────────────────────────────

const mockCategories: Category[] = [
  { id: 1, description: "COMIDA", isActive: true, isDeletable: false },
  { id: 2, description: "transporte", isActive: true, isDeletable: true },
  { id: 3, description: "oCIO", isActive: true, isDeletable: true },
];

const newCategory: Category = {
  id: 4,
  description: "salud",
  isActive: true,
  isDeletable: true,
};

const server = setupServer(
  // GET /workspace/categories (sin workspaceId - usa DEFAULT_WORKSPACE del usuario)
  http.get("http://localhost:8080/workspace/categories", () =>
    HttpResponse.json(mockCategories),
  ),
  // POST /workspace/categories?description=...
  http.post("http://localhost:8080/workspace/categories", () =>
    HttpResponse.json(newCategory, { status: 201 }),
  ),
  // DELETE /workspace/categories/{categoryId}
  http.delete("http://localhost:8080/workspace/categories/:categoryId", () =>
    new HttpResponse(null, { status: 204 }),
  ),
  // PATCH /workspace/categories/migrate
  http.patch("http://localhost:8080/workspace/categories/migrate", () =>
    new HttpResponse(null, { status: 200 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

// ── useCategory ────────────────────────────────────────────────────────────

describe("useCategory", () => {
  it("calls GET /workspace/categories and returns the category list", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCategory(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(mockCategories.length);
  });

  it("capitalizes description: first letter uppercase, rest lowercase", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCategory(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data![0].description).toBe("Comida");
    expect(result.current.data![1].description).toBe("Transporte");
    expect(result.current.data![2].description).toBe("Ocio");
  });

  it("preserves all other category fields unchanged", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCategory(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const first = result.current.data![0];
    expect(first.id).toBe(1);
    expect(first.isActive).toBe(true);
    expect(first.isDeletable).toBe(false);
  });

  it("returns error state when the request fails", async () => {
    server.use(
      http.get("http://localhost:8080/workspace/categories", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCategory(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("returns an empty array when the server returns an empty list", async () => {
    server.use(
      http.get("http://localhost:8080/workspace/categories", () =>
        HttpResponse.json([]),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCategory(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("does not mark data as stale immediately (staleTime 5 min)", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCategory(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isStale).toBe(false);
  });
});

// ── useAddCategory ─────────────────────────────────────────────────────────

describe("useAddCategory", () => {
  it("calls POST /workspace/categories and returns the created category", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAddCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ description: "salud" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(newCategory);
  });

  it("sends description as query param", async () => {
    let capturedDescription: string | null = null;
    server.use(
      http.post("http://localhost:8080/workspace/categories", ({ request }) => {
        const url = new URL(request.url);
        capturedDescription = url.searchParams.get("description");
        return HttpResponse.json(newCategory, { status: 201 });
      }),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAddCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ description: "nueva" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedDescription).toBe("nueva");
  });

  it("invalidates categories query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAddCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ description: "salud" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["categories"],
    });
  });

  it("returns error state when POST fails", async () => {
    server.use(
      http.post("http://localhost:8080/workspace/categories", () =>
        HttpResponse.json({ message: "Bad Request" }, { status: 400 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAddCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ description: "salud" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

// ── useDeleteCategory ──────────────────────────────────────────────────────

describe("useDeleteCategory", () => {
  it("calls DELETE /workspace/categories/{categoryId} and resolves successfully", async () => {
    let capturedCategoryId: string | null = null;
    server.use(
      http.delete("http://localhost:8080/workspace/categories/:categoryId", ({ params }) => {
        capturedCategoryId = params.categoryId as string;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ categoryId: 2 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedCategoryId).toBe("2");
  });

  it("invalidates categories query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ categoryId: 2 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["categories"],
    });
  });

  it("returns error state when DELETE returns 404", async () => {
    server.use(
      http.delete("http://localhost:8080/workspace/categories/:categoryId", () =>
        HttpResponse.json({ message: "Not Found" }, { status: 404 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ categoryId: 99 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── useMigrateCategory ─────────────────────────────────────────────────────

describe("useMigrateCategory", () => {
  it("calls PATCH /workspace/categories/migrate with the correct payload", async () => {
    let capturedBody: unknown;
    server.use(
      http.patch("http://localhost:8080/workspace/categories/migrate", async ({ request }) => {
        capturedBody = await request.json();
        return new HttpResponse(null, { status: 200 });
      }),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useMigrateCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ fromCategoryId: 1, toCategoryId: 2 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedBody).toEqual({ fromCategoryId: 1, toCategoryId: 2 });
  });

  it("invalidates categories and movement-history queries on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useMigrateCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ fromCategoryId: 1, toCategoryId: 2 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["categories"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["movement-history"] });
  });

  it("returns error state when PATCH fails", async () => {
    server.use(
      http.patch("http://localhost:8080/workspace/categories/migrate", () =>
        HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useMigrateCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ fromCategoryId: 1, toCategoryId: 2 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
