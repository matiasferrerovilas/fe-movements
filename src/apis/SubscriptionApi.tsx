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
  groupId: number;
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
  return api
    .patch(`${BASE_PATH}/` + serviceToUpdate.id, serviceToUpdate.changes)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating subscriptions:", error);
      throw error;
    });
}
export async function addSubscriptionApi(service: ServiceToAdd) {
  return api
    .post(BASE_PATH, service)
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
