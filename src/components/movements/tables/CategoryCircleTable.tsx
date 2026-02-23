import {
  CarOutlined,
  CoffeeOutlined,
  FieldTimeOutlined,
  GiftOutlined,
  HomeOutlined,
  LaptopOutlined,
  QuestionOutlined,
  ShoppingCartOutlined,
  SkinOutlined,
  ToolOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { capitalizeFirst } from "../../utils/stringFunctions";
import { Popover } from "antd";

const categoryIconMap: Record<
  string,
  { icon: React.ReactNode; color: string }
> = {
  hogar: { icon: <HomeOutlined />, color: "#faad14" },
  regalos: { icon: <GiftOutlined />, color: "#eb2f96" },
  restaurante: { icon: <CoffeeOutlined />, color: "#fa541c" },
  ropa: { icon: <SkinOutlined />, color: "#722ed1" },
  servicios: { icon: <ToolOutlined />, color: "#1890ff" },
  "sin categoria": { icon: <QuestionOutlined />, color: "#d9d9d9" },
  streaming: { icon: <VideoCameraOutlined />, color: "#13c2c2" },
  supermercado: { icon: <ShoppingCartOutlined />, color: "#52c41a" },
  tecnologia: { icon: <LaptopOutlined />, color: "#2f54eb" },
  transporte: { icon: <CarOutlined />, color: "#9254de" },
  viaje: { icon: <FieldTimeOutlined />, color: "#fa8c16" },
};

export default function CategoryCircleTable({
  category,
}: {
  category?: string;
}) {
  const key = category?.toLowerCase() ?? "sin categoria";
  const { icon, color } =
    categoryIconMap[key] ?? categoryIconMap["sin categoria"];

  return (
    <Popover content={category}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          color: "#fff",
        }}
        title={capitalizeFirst(category)}
      >
        {icon}
      </div>
    </Popover>
  );
}
