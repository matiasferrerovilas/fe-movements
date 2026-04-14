import dayjs from "dayjs";
import type { CurrencyRecord } from "../models/Currency";
import type { Service, ServiceToUpdate } from "../models/Service";
import { api } from "./axios";

const BASE_PATH = "/subscriptions";

export interface ServiceToAdd {
  amount: number;
  description: string;
  currency: CurrencyRecord;
  lastPayment: Date | null;
  isPaid: boolean;
}

export const getSubscriptionsApi = () =>
  api.get<Service[]>(BASE_PATH).then((response) => response.data);

export const paySubscriptionApi = (service: Service) =>
  api.patch(`${BASE_PATH}/${service.id}/payment`).then((response) => response.data);

export const updateSubscriptionApi = (serviceToUpdate: ServiceToUpdate) => {
  const { workspace: _workspace, ...changes } = serviceToUpdate.changes;
  const payload = {
    ...changes,
    lastPayment: changes.lastPayment
      ? dayjs(changes.lastPayment).format("YYYY-MM-DD")
      : null,
  };
  return api
    .patch(`${BASE_PATH}/${serviceToUpdate.id}`, payload)
    .then((response) => response.data);
};

export const addSubscriptionApi = (service: ServiceToAdd) => {
  const payload = {
    ...service,
    lastPayment: service.lastPayment
      ? dayjs(service.lastPayment).format("YYYY-MM-DD")
      : null,
  };
  return api.post(BASE_PATH, payload).then((response) => response.data);
};

export const deleteSubscriptionApi = (service: Service) =>
  api.delete(`${BASE_PATH}/${service.id}`).then((response) => response.data);
