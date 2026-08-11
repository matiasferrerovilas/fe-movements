import { Flex, Popover } from "antd";
import React, { useMemo } from "react";
import { capitalizeFirst } from "@/utils/stringFunctions";
import type { Category } from "@/models/Category";
import { getIconComponent } from "@/utils/getIconComponent";

function CategoryIconCircle({ category }: { category?: Category }) {
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
  );
}

function CategoryCircle({ category }: { category?: Category }) {
  const displayName = category?.description ?? "Sin categoría";

  return (
    <Popover content={capitalizeFirst(displayName)}>
      <span style={{ display: "inline-flex" }}>
        <CategoryIconCircle category={category} />
      </span>
    </Popover>
  );
}

function CategoryHalfIcon({
  category,
  side,
}: {
  category?: Category;
  side: "left" | "right";
}) {
  const IconComponent = getIconComponent(category?.iconName ?? "QuestionOutlined");
  const color = category?.iconColor ?? "#d9d9d9";

  return (
    <div
      style={{
        width: 16,
        height: 32,
        overflow: "hidden",
        position: "relative",
        backgroundColor: color,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          position: "absolute",
          top: 0,
          [side]: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconComponent style={{ fontSize: 16, color: "#fff" }} />
      </div>
    </div>
  );
}

function SplitCategoryCircle({ categories }: { categories: Category[] }) {
  const [first, second] = categories;
  const names = categories
    .map((category) => capitalizeFirst(category.description ?? "Sin categoría"))
    .join(" / ");

  return (
    <Popover
      content={
        <Flex vertical gap={8}>
          {categories.map((category) => (
            <Flex key={category.id} align="center" gap={8}>
              <CategoryIconCircle category={category} />
              <span>{capitalizeFirst(category.description ?? "Sin categoría")}</span>
            </Flex>
          ))}
        </Flex>
      }
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
        }}
        title={names}
      >
        <CategoryHalfIcon category={first} side="left" />
        <CategoryHalfIcon category={second} side="right" />
      </div>
    </Popover>
  );
}

export default function CategoryCircleTable({
  categories,
}: {
  categories?: Category[];
}) {
  if (!categories || categories.length === 0) {
    return <CategoryCircle />;
  }

  if (categories.length === 1) {
    return <CategoryCircle category={categories[0]} />;
  }

  return <SplitCategoryCircle categories={categories} />;
}
