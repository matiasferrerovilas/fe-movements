import { useCallback, useState } from "react";

const DEFAULT_PAGE_SIZE = 25;

export function usePagination(
  initialPage: number = 0,
  initialPageSize: number = DEFAULT_PAGE_SIZE,
) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const nextPage = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 0));
  }, []);

  const goToPage = useCallback((p: number) => setPage(Math.max(p, 0)), []);

  const resetPage = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(0);
  }, []);

  return {
    page,
    pageSize,
    nextPage,
    prevPage,
    resetPage,
    goToPage,
    changePageSize,
    canGoPrev: page > 0,
  };
}
