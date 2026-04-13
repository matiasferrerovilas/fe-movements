import { createFileRoute } from "@tanstack/react-router";
import { App, Col, Row } from "antd";
import type { ServiceToAdd } from "../apis/SubscriptionApi";
import { ServiceCard } from "../components/services/ServiceCard";
import { ServiceCardForm } from "../components/services/ServiceCardForm";
import {
  useAddService,
  usePayService,
  useSubscription,
  useUpdateService,
} from "../apis/hooks/useService";
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
  const { message } = App.useApp();

  useServiceSubscription();

  const payMutation = usePayService();
  const updateServiceMutation = useUpdateService({
    onSuccess: () => {
      void message.success("Servicio actualizado");
    },
  });
  const addServiceMutation = useAddService({
    onSuccess: () => {
      void message.success("Servicio agregado");
    },
  });

  const handleAddService = (service: ServiceToAdd) => {
    addServiceMutation.mutate(service);
  };
  return (
    <div style={{ paddingTop: 30 }}>
      <div className="fade-in-up" style={{ animationDelay: "0ms" }}>
        <ServiceSummary services={services} isFetching={isFetching} />
      </div>

      <Row gutter={16} style={{ marginBottom: 16, padding: 0 }}>
        <Col
          xs={24}
          sm={12}
          lg={8}
          style={{ marginBottom: 16, animationDelay: "80ms" }}
          className="fade-in-up"
        >
          <ServiceCardForm handleAddService={handleAddService} />
        </Col>
        {services?.map((service, index) => (
          <Col
            xs={24}
            sm={12}
            lg={8}
            key={service.id}
            style={{ marginBottom: 16, animationDelay: `${(index + 2) * 80}ms` }}
            className="fade-in-up"
          >
            <ServiceCard
              service={service}
              handlePayServiceMutation={(s) => payMutation.mutate(s)}
              handleUpdateServiceMutation={(s) => updateServiceMutation.mutate(s)}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}
