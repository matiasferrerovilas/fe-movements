import { SearchOutlined } from "@ant-design/icons";
import { Flex, Input, theme, Typography } from "antd";
import { useMemo, useState } from "react";
import { AVAILABLE_ICONS, searchIcons } from "../../utils/availableIcons";
import { getIconComponent } from "../../utils/getIconComponent";

const { Text } = Typography;

interface IconPickerProps {
  value?: string | null;
  onChange: (iconName: string) => void;
  selectedColor?: string | null;
}

export function IconPicker({ value, onChange, selectedColor }: IconPickerProps) {
  const { token } = theme.useToken();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIcons = useMemo(
    () => searchIcons(searchTerm),
    [searchTerm],
  );

  const displayColor = selectedColor ?? "#1890ff";

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
        Ícono
      </Text>

      {/* Buscador */}
      <Input
        prefix={<SearchOutlined />}
        placeholder="Buscar ícono..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          borderRadius: 8,
          marginBottom: 12,
        }}
        allowClear
      />

      {/* Grid de iconos */}
      <div
        style={{
          maxHeight: 320,
          overflowY: "auto",
          overflowX: "hidden",
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 8,
          padding: 8,
          backgroundColor: token.colorBgContainer,
        }}
      >
        {filteredIcons.length === 0 ? (
          <Text
            type="secondary"
            style={{
              display: "block",
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            No se encontraron íconos
          </Text>
        ) : (
          <Flex wrap="wrap" gap={6}>
            {filteredIcons.map((icon) => {
              const isSelected = value === icon.name;
              const IconComponent = getIconComponent(icon.name);

              return (
                <div
                  key={icon.name}
                  onClick={() => onChange(icon.name)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    backgroundColor: isSelected
                      ? displayColor
                      : token.colorBgLayout,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: isSelected
                      ? `2px solid ${token.colorPrimary}`
                      : `1px solid ${token.colorBorder}`,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = token.colorFillTertiary;
                      e.currentTarget.style.transform = "scale(1.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = token.colorBgLayout;
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                  title={icon.keywords.join(", ")}
                >
                  <IconComponent
                    style={{
                      fontSize: 20,
                      color: isSelected ? "#fff" : token.colorText,
                    }}
                  />
                </div>
              );
            })}
          </Flex>
        )}
      </div>

      {/* Info sobre el ícono seleccionado */}
      {value && (
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            display: "block",
            marginTop: 8,
          }}
        >
          Seleccionado: {value}
        </Text>
      )}

      {/* Contador de resultados */}
      <Text
        type="secondary"
        style={{
          fontSize: 11,
          display: "block",
          marginTop: 4,
        }}
      >
        {filteredIcons.length} de {AVAILABLE_ICONS.length} íconos
      </Text>
    </div>
  );
}
