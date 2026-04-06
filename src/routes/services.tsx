import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Col, Row, message } from "antd";
import {
  addSubscriptionApi,
  paySubscriptionApi,
  updateSubscriptionApi,
  type ServiceToAdd,
} from "../apis/SubscriptionApi";
import { ServiceCard } from "../components/services/ServiceCard";
import type { Service, ServiceToUpdate } from "../models/Service";
import { ServiceCardForm } from "../components/services/ServiceCardForm";
import { useSubscription } from "../apis/hooks/useService";
import { useServiceSubscription } from "../apis/websocket/useServiceSubscription";
import { ServiceSummary } from "../components/services/ServiceSummary";
import { protectedRouteGuard } from "../apis/auth/protectedRouteGuard";
import { RoleEnum } from "../enums/RoleEnum";

export const Route = createFileRoute("/services")({
  beforeLoad: protectedRouteGuard({
    roles: [RoleEnum.ADMIN, RoleEnum.FAMILY, RoleEnum.GUEST],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.invalidateQueries({ queryKey: ["service-history"] });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: services = [], isFetching } = useSubscription();

  useServiceSubscription();

  const payMutation = useMutation({
    mutationFn: ({ service }: { service: Service }) => paySubscriptionApi(service),
    onError: (err) => {
      console.error("Error pagando el servicio:", err);
    },
  });
  const updateServiceMutation = useMutation({
    mutationFn: ({ service }: { service: ServiceToUpdate }) =>
      updateSubscriptionApi(service),
    onSuccess: () => {
      void message.success("Servicio actualizado");
    },
    onError: (err) => {
      console.error("Error actualizando el servicio:", err);
    },
  });
  const addServiceMutation = useMutation({
    mutationFn: ({ service }: { service: ServiceToAdd }) =>
      addSubscriptionApi(service),
    onSuccess: () => {
      void message.success("Servicio agregado");
    },
    onError: (err) => {
      console.error("Error agregando el servicio:", err);
    },
  });

  const handlePayServiceMutation = (service: Service) => {
    payMutation.mutate({ service });
  };
  const handleUpdateServiceMutation = (service: ServiceToUpdate) => {
    updateServiceMutation.mutate({ service });
  };
  const handleAddService = (service: ServiceToAdd) => {
    addServiceMutation.mutate({ service });
  };
  return (
    <div style={{ paddingTop: 30 }}>
      <ServiceSummary services={services} isFetching={isFetching} />

      <Row gutter={16} style={{ marginBottom: 16, padding: 0 }}>
        <Col xs={24} sm={12} lg={8} style={{ marginBottom: 16 }}>
          <ServiceCardForm handleAddService={handleAddService} />
        </Col>
        {services?.map((service) => (
          <Col
            xs={24}
            sm={12}
            lg={8}
            key={service.id}
            style={{ marginBottom: 16 }}
          >
            <ServiceCard
              service={service}
              handlePayServiceMutation={handlePayServiceMutation}
              handleUpdateServiceMutation={handleUpdateServiceMutation}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}
