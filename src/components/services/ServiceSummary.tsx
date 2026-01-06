import { Card, Col, Row, Typography } from "antd";
import type { Service } from "../../models/Service";

const { Title, Text } = Typography;

interface ServiceSummaryProps {
  services: Service[];
  isFetching: boolean;
}

export function ServiceSummary({ services, isFetching }: ServiceSummaryProps) {
  const unpaidServices = services?.filter((s) => !s.isPaid) ?? [];
  const paidServices = services?.filter((s) => s.isPaid) ?? [];

  const totalPaid = paidServices.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalUnpaid = unpaidServices.reduce(
    (acc, s) => acc + (s.amount || 0),
    0
  );

  return (
    <Row
      gutter={16}
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 30,
        padding: 0,
      }}
    >
      <Col
        xs={24}
        md={12}
        lg={8}
        style={{
          marginBottom: 10,
        }}
      >
        <Card
          loading={isFetching}
          title="Total Servicios"
          style={{ textAlign: "center" }}
        >
          <Title level={2} style={{ margin: 0 }}>
            {services?.length ?? 0}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Servicios Registrados
          </Text>
        </Card>
      </Col>

      <Col
        xs={24}
        md={12}
        lg={8}
        style={{
          marginBottom: 10,
        }}
      >
        <Card
          loading={isFetching}
          title="Pagados"
          style={{ textAlign: "center" }}
        >
          <Title level={2} style={{ margin: 0 }}>
            ${totalPaid.toFixed(2)}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {paidServices.length} Servicios al día
          </Text>
        </Card>
      </Col>

      <Col
        xs={24}
        md={12}
        lg={8}
        style={{
          marginBottom: 10,
        }}
      >
        <Card
          loading={isFetching}
          title="Pendientes"
          style={{ textAlign: "center" }}
        >
          <Title level={2} style={{ margin: 0 }}>
            ${totalUnpaid.toFixed(2)}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {unpaidServices.length} Servicios pendientes
          </Text>
        </Card>
      </Col>
    </Row>
  );
}
