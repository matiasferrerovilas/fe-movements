import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import CategoryCircleTable from "../../../../src/components/movements/tables/CategoryCircleTable";
import type { Category } from "../../../../src/models/Category";

describe("CategoryCircleTable", () => {
  const createMockCategory = (overrides?: Partial<Category>): Category => ({
    id: 1,
    description: "Hogar",
    isActive: true,
    isDeletable: true,
    workspaceId: 1,
    iconName: "HomeOutlined",
    iconColor: "#faad14",
    ...overrides,
  });

  it("renderiza el ícono de categoría con iconName e iconColor dinámicos", () => {
    const category = createMockCategory({
      description: "Hogar",
      iconName: "HomeOutlined",
      iconColor: "#faad14",
    });
    const { container } = render(<CategoryCircleTable category={category} />);
    
    // Verifica que existe el div circular con el ícono
    const circle = container.querySelector("div[style*='border-radius']") as HTMLElement;
    expect(circle).toBeTruthy();
    // Verifica que el color es el correcto
    expect(circle.style.backgroundColor).toBe("rgb(250, 173, 20)"); // #faad14 en RGB
  });

  it("usa iconName e iconColor personalizados", () => {
    const category = createMockCategory({
      description: "Transporte",
      iconName: "CarOutlined",
      iconColor: "#9254de",
    });
    const { container } = render(<CategoryCircleTable category={category} />);
    
    const circle = container.querySelector("div[style*='border-radius']") as HTMLElement;
    expect(circle).toBeTruthy();
    // Verifica que el color es el correcto
    expect(circle.style.backgroundColor).toBe("rgb(146, 84, 222)"); // #9254de en RGB
  });

  it("usa defaults cuando iconName e iconColor son null", () => {
    const category = createMockCategory({
      description: "Sin ícono",
      iconName: null,
      iconColor: null,
    });
    const { container } = render(<CategoryCircleTable category={category} />);
    
    const circle = container.querySelector("div[style*='border-radius']") as HTMLElement;
    expect(circle).toBeTruthy();
    // Verifica que usa el color por defecto #d9d9d9
    expect(circle.style.backgroundColor).toBe("rgb(217, 217, 217)"); // #d9d9d9 en RGB
  });

  it("capitaliza correctamente el nombre de la categoría en el Popover", async () => {
    const user = userEvent.setup();
    const category = createMockCategory({
      description: "HOGAR",
    });
    const { container } = render(<CategoryCircleTable category={category} />);

    const circle = container.querySelector("div[style*='border-radius']");
    expect(circle).toBeTruthy();

    // Hacer hover para mostrar el Popover
    await user.hover(circle!);

    // El Popover debe mostrar "Hogar" (capitalizado)
    await screen.findByText("Hogar");
  });

  it("capitaliza correctamente categorías mixtas en el Popover", async () => {
    const user = userEvent.setup();
    const category = createMockCategory({
      description: "Sin Categoria",
    });
    const { container } = render(<CategoryCircleTable category={category} />);

    const circle = container.querySelector("div[style*='border-radius']");
    expect(circle).toBeTruthy();

    await user.hover(circle!);

    // Debe mostrar "Sin categoria" (primera mayúscula, resto minúscula)
    await screen.findByText("Sin categoria");
  });

  it("capitaliza correctamente categorías en minúsculas en el Popover", async () => {
    const user = userEvent.setup();
    const category = createMockCategory({
      description: "supermercado",
    });
    const { container } = render(<CategoryCircleTable category={category} />);

    const circle = container.querySelector("div[style*='border-radius']");
    expect(circle).toBeTruthy();

    await user.hover(circle!);

    // Debe mostrar "Supermercado"
    await screen.findByText("Supermercado");
  });

  it("muestra 'Sin categoría' cuando la categoría es undefined", async () => {
    const user = userEvent.setup();
    const { container } = render(<CategoryCircleTable category={undefined} />);

    const circle = container.querySelector("div[style*='border-radius']");
    expect(circle).toBeTruthy();

    await user.hover(circle!);

    // Debe mostrar "Sin categoría" para categoría undefined
    await screen.findByText("Sin categoría");
  });

  it("capitaliza el atributo title del div", () => {
    const category = createMockCategory({
      description: "TECNOLOGIA",
    });
    const { container } = render(<CategoryCircleTable category={category} />);
    const circle = container.querySelector("div[title]") as HTMLElement;
    
    expect(circle.getAttribute("title")).toBe("Tecnologia");
  });

  it("soporta iconos personalizados de Ant Design", () => {
    const customCategories = [
      { iconName: "ShoppingCartOutlined", iconColor: "#52c41a" },
      { iconName: "VideoCameraOutlined", iconColor: "#13c2c2" },
      { iconName: "LaptopOutlined", iconColor: "#2f54eb" },
      { iconName: "GiftOutlined", iconColor: "#eb2f96" },
    ];

    customCategories.forEach((props) => {
      const category = createMockCategory(props);
      const { container } = render(<CategoryCircleTable category={category} />);
      const circle = container.querySelector("div[style*='border-radius']");
      expect(circle).toBeTruthy();
    });
  });
});
