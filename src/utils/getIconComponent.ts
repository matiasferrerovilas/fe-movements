import * as Icons from "@ant-design/icons";
import { QuestionOutlined } from "@ant-design/icons";
import type React from "react";

/**
 * Obtiene el componente de ícono de Ant Design por su nombre.
 * Si el nombre no existe, retorna QuestionOutlined por defecto.
 * 
 * @param iconName Nombre del ícono (ej: "HomeOutlined")
 * @returns Componente React del ícono
 * 
 * @example
 * const IconComponent = getIconComponent("HomeOutlined");
 * return <IconComponent />;
 */
export const getIconComponent = (
  iconName?: string | null,
): React.ComponentType<{ style?: React.CSSProperties }> => {
  if (!iconName) {
    return QuestionOutlined;
  }

  // Verificar que el ícono existe en el módulo de Ant Design
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[
    iconName
  ];

  if (!IconComponent || (typeof IconComponent !== "function" && typeof IconComponent !== "object")) {
    console.warn(
      `Ícono "${iconName}" no encontrado en @ant-design/icons. Usando QuestionOutlined por defecto.`,
    );
    return QuestionOutlined;
  }

  return IconComponent;
};
