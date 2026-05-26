import { Button, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import dayjs from "dayjs";
import type { Investment } from "../../models/Investment";

const { Text } = Typography;

interface InvestmentTableProps {
  investments: Investment[];
  isFetching: boolean;
  onEdit: (investment: Investment) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export function InvestmentTable({
  investments,
  isFetching,
  onEdit,
  onDelete,
  isDeleting,
}: InvestmentTableProps) {
  const columns: ColumnsType<Investment> = [
    {
      title: "Instrumento",
      dataIndex: "instrumento",
      key: "instrumento",
    },
    {
      title: "Tipo",
      key: "tipo",
      render: (_, record) => (
        <Tag color={record.tipo.iconColor ?? undefined}>{record.tipo.description}</Tag>
      ),
    },
    {
      title: "Monto invertido",
      key: "montoInvertido",
      render: (_, record) => (
        <Text>
          {record.moneda.symbol} {record.montoInvertido.toLocaleString("es-AR")}
        </Text>
      ),
    },
    {
      title: "Valor actual",
      key: "valorActual",
      render: (_, record) => (
        <Text>
          {record.moneda.symbol} {record.valorActual.toLocaleString("es-AR")}
        </Text>
      ),
    },
    {
      title: "G / P",
      key: "gp",
      render: (_, record) => {
        const gp = record.valorActual - record.montoInvertido;
        const isPositive = gp >= 0;
        return (
          <Text
            data-testid={`gp-${record.id}`}
            style={{ color: isPositive ? "#3f8600" : "#cf1322" }}
          >
            {isPositive ? "+" : ""}
            {record.moneda.symbol} {gp.toLocaleString("es-AR")}
          </Text>
        );
      },
    },
    {
      title: "Rendimiento",
      key: "rendimiento",
      render: (_, record) => {
        const gp = record.valorActual - record.montoInvertido;
        const pct = record.montoInvertido > 0 ? (gp / record.montoInvertido) * 100 : 0;
        const isPositive = pct >= 0;
        return (
          <Text style={{ color: isPositive ? "#3f8600" : "#cf1322" }}>
            {isPositive ? "+" : ""}
            {pct.toFixed(2)}%
          </Text>
        );
      },
    },
    {
      title: "Fecha",
      key: "fecha",
      render: (_, record) => dayjs(record.fechaInversion).format("DD/MM/YYYY"),
    },
    {
      title: "Hace cuánto",
      key: "haceCuanto",
      render: (_, record) => dayjs(record.fechaInversion).fromNow(),
    },
    {
      title: "",
      key: "acciones",
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              size="small"
              aria-label="editar"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              aria-label="eliminar"
              loading={isDeleting}
              onClick={() => onDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={investments}
      columns={columns}
      rowKey="id"
      loading={isFetching}
      locale={{ emptyText: "Sin inversiones registradas" }}
      pagination={false}
      scroll={{ x: true }}
    />
  );
}
