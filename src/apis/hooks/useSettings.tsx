import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserDefault,
  getUserDefaults,
  setUserDefault,
} from "../settings/SettingsApi";
import type { UserSettingKey } from "../../models/UserSetting";

const USER_DEFAULTS_QUERY_KEY = "user-defaults" as const;

// Query keys de datos que dependen del workspace activo
const WORKSPACE_DEPENDENT_QUERY_KEYS = [
  "categories",
  "budgets",
  "workspace-members",
  "movement-history",
  "service-history",
] as const;

export const useUserDefaults = () =>
  useQuery({
    queryKey: [USER_DEFAULTS_QUERY_KEY],
    queryFn: () => getUserDefaults(),
    staleTime: 5 * 60 * 1000,
  });

export const useUserDefault = (key: UserSettingKey) =>
  useQuery({
    queryKey: [USER_DEFAULTS_QUERY_KEY, key],
    queryFn: () => getUserDefault(key),
    staleTime: 5 * 60 * 1000,
  });

export const useSetUserDefault = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: UserSettingKey; value: number }) =>
      setUserDefault(key, value),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: [USER_DEFAULTS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [USER_DEFAULTS_QUERY_KEY, key],
      });

      // Cuando cambia el workspace activo, invalidar todas las queries
      // que dependen del workspace (categorías, presupuestos, miembros, etc.)
      if (key === "DEFAULT_WORKSPACE") {
        WORKSPACE_DEPENDENT_QUERY_KEYS.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
    },
    onError: (err) => console.error("Error setting user default:", err),
  });
};
