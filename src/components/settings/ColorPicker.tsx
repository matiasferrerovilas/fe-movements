import CheckOutlined from "@ant-design/icons/CheckOutlined";
import { Flex, theme, Typography } from "antd";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

/**
 * Paleta de colores predefinidos para categorías.
 * Basado en la paleta de colores de Ant Design.
 * Los nombres se traducen en el componente vía settings.colorPicker.colors.*
 */
const PRESET_COLORS = [
  { name: "Rojo", key: "red", value: "#f5222d" },
  { name: "Naranja Oscuro", key: "darkOrange", value: "#fa541c" },
  { name: "Naranja", key: "orange", value: "#fa8c16" },
  { name: "Dorado", key: "gold", value: "#faad14" },
  { name: "Amarillo", key: "yellow", value: "#fadb14" },
  { name: "Lima", key: "lime", value: "#a0d911" },
  { name: "Verde", key: "green", value: "#52c41a" },
  { name: "Cian", key: "cyan", value: "#13c2c2" },
  { name: "Azul", key: "blue", value: "#1890ff" },
  { name: "Azul Profundo", key: "deepBlue", value: "#2f54eb" },
  { name: "Púrpura", key: "purple", value: "#722ed1" },
  { name: "Magenta", key: "magenta", value: "#eb2f96" },
  { name: "Violeta", key: "violet", value: "#9254de" },
  { name: "Gris", key: "gray", value: "#8c8c8c" },
  { name: "Gris Claro", key: "lightGray", value: "#d9d9d9" },
];

// Exportar para uso en CategoryEditModal
export { PRESET_COLORS };

interface ColorPickerProps {
  value?: string | null;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const { token } = theme.useToken();
  const { t } = useTranslation();

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
        {t("settings.colorPicker.label")}
      </Text>
      <Flex wrap="wrap" gap={8}>
        {PRESET_COLORS.map((color) => {
          const isSelected = value === color.value;
          const colorName = t(`settings.colorPicker.colors.${color.key}`);
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
              title={colorName}
              aria-label={t("settings.colorPicker.colorAriaLabel", { name: colorName })}
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
