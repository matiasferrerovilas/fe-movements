import { Popover } from "antd";
import React, { useMemo } from "react";
import { capitalizeFirst } from "../../utils/stringFunctions";
import type { Category } from "../../../models/Category";
import { getIconComponent } from "../../../utils/getIconComponent";

export default function CategoryCircleTable({
  category,
}: {
  category?: Category;
}) {
  // Usar iconName e iconColor de la categoría, o defaults si no están definidos
  const iconElement = useMemo(() => {
    const IconComponent = getIconComponent(category?.iconName ?? "QuestionOutlined");
    return React.createElement(IconComponent, {
      style: { fontSize: 16, color: "#fff" },
    });
  }, [category?.iconName]);

  const color = category?.iconColor ?? "#d9d9d9";
  const displayName = category?.description ?? "Sin categoría";

  return (
    <Popover content={capitalizeFirst(displayName)}>
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
        title={capitalizeFirst(displayName)}
      >
        {iconElement}
      </div>
    </Popover>
  );
}
