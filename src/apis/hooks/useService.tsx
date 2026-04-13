import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addSubscriptionApi,
  deleteSubscriptionApi,
  getSubscriptionsApi,
  paySubscriptionApi,
  updateSubscriptionApi,
  type ServiceToAdd,
} from "../SubscriptionApi";
import type { Service, ServiceToUpdate } from "../../models/Service";

const SERVICE_KEY = ["service-history"] as const;

export const useSubscription = () =>
  useQuery({
    queryKey: SERVICE_KEY,
    queryFn: () => getSubscriptionsApi(),
    staleTime: 5 * 60 * 1000,
  });

export const usePayService = () =>
  useMutation({
    mutationFn: (service: Service) => paySubscriptionApi(service),
    onError: (err) => {
      console.error("Error pagando el servicio:", err);
    },
  });

export const useUpdateService = (options?: {
  onSuccess?: () => void;
}) =>
  useMutation({
    mutationFn: (service: ServiceToUpdate) => updateSubscriptionApi(service),
    onSuccess: options?.onSuccess,
    onError: (err) => {
      console.error("Error actualizando el servicio:", err);
    },
  });

export const useAddService = (options?: {
  onSuccess?: () => void;
}) =>
  useMutation({
    mutationFn: (service: ServiceToAdd) => addSubscriptionApi(service),
    onSuccess: options?.onSuccess,
    onError: (err) => {
      console.error("Error agregando el servicio:", err);
    },
  });

export const useDeleteService = () =>
  useMutation({
    mutationFn: (service: Service) => deleteSubscriptionApi(service),
    onError: (err) => {
      console.error("Error eliminando el servicio:", err);
    },
    onSuccess: () => {
      console.debug("Servicio eliminado correctamente");
    },
  });
