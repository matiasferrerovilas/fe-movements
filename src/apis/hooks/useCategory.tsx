import { useQuery } from "@tanstack/react-query";
import { getCategoriesApi } from "../CategoryApi";

const CATEGORIES_QUERY_KEY = "categories" as const;

export const useCategory = () =>
  useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: () => getCategoriesApi(),
    staleTime: 5 * 60 * 1000,
  });
