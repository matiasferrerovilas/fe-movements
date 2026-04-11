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
  workspaceId: number;
}
export async function getSubscriptionsApi() {
  return api
    .get<Service[]>(BASE_PATH)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching subscriptions:", error);
      throw error;
    });
}

export async function paySubscriptionApi(service: Service) {
  return api
    .patch(`${BASE_PATH}/` + service.id + "/payment")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating subscriptions:", error);
      throw error;
    });
}
export async function updateSubscriptionApi(serviceToUpdate: ServiceToUpdate) {
  const payload = {
    ...serviceToUpdate.changes,
    lastPayment: serviceToUpdate.changes.lastPayment
      ? dayjs(serviceToUpdate.changes.lastPayment).format("YYYY-MM-DD")
      : null,
  };
  return api
    .patch(`${BASE_PATH}/` + serviceToUpdate.id, payload)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating subscriptions:", error);
      throw error;
    });
}
export async function addSubscriptionApi(service: ServiceToAdd) {
  const payload = {
    ...service,
    lastPayment: service.lastPayment
      ? dayjs(service.lastPayment).format("YYYY-MM-DD")
      : null,
  };
  return api
    .post(BASE_PATH, payload)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating subscriptions:", error);
      throw error;
    });
}

export async function deleteSubscriptionApi(service: Service) {
  return api
    .delete(`${BASE_PATH}/` + service.id)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating subscriptions:", error);
      throw error;
    });
}
