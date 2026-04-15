import { CheckOutlined } from "@ant-design/icons";
import { Flex, theme, Typography } from "antd";

const { Text } = Typography;

/**
 * Paleta de colores predefinidos para categorías.
 * Basado en la paleta de colores de Ant Design.
 */
export const PRESET_COLORS = [
  { name: "Rojo", value: "#f5222d" },
  { name: "Naranja Oscuro", value: "#fa541c" },
  { name: "Naranja", value: "#fa8c16" },
  { name: "Dorado", value: "#faad14" },
  { name: "Amarillo", value: "#fadb14" },
  { name: "Lima", value: "#a0d911" },
  { name: "Verde", value: "#52c41a" },
  { name: "Cian", value: "#13c2c2" },
  { name: "Azul", value: "#1890ff" },
  { name: "Azul Profundo", value: "#2f54eb" },
  { name: "Púrpura", value: "#722ed1" },
  { name: "Magenta", value: "#eb2f96" },
  { name: "Violeta", value: "#9254de" },
  { name: "Gris", value: "#8c8c8c" },
  { name: "Gris Claro", value: "#d9d9d9" },
];

interface ColorPickerProps {
  value?: string | null;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const { token } = theme.useToken();

  return (
    <div>
      <Text
        strong
        style={{
          fontSize: 13,
          color: token.colorText,
          display: "block",
          marginBottom: 8,
        }}
      >
        Color
      </Text>
      <Flex wrap="wrap" gap={8}>
        {PRESET_COLORS.map((color) => {
          const isSelected = value === color.value;
          return (
            <div
              key={color.value}
              onClick={() => onChange(color.value)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: color.value,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: isSelected
                  ? `3px solid ${token.colorPrimary}`
                  : `1px solid ${token.colorBorder}`,
                transition: "all 0.2s ease",
                boxShadow: isSelected
                  ? `0 2px 8px ${color.value}80`
                  : "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = "scale(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              title={color.name}
            >
              {isSelected && (
                <CheckOutlined
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "bold",
                    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
                  }}
                />
              )}
            </div>
          );
        })}
      </Flex>
    </div>
  );
}
