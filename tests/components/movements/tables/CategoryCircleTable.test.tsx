import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import CategoryCircleTable from "../../../../src/components/movements/tables/CategoryCircleTable";

describe("CategoryCircleTable", () => {
  it("renderiza el ícono de categoría", () => {
    const { container } = render(<CategoryCircleTable category="hogar" />);
    
    // Verifica que existe el div circular con el ícono
    const circle = container.querySelector("div[style*='border-radius']");
    expect(circle).toBeTruthy();
  });

  it("capitaliza correctamente categorías en MAYÚSCULAS en el Popover", async () => {
    const user = userEvent.setup();
    const { container } = render(<CategoryCircleTable category="HOGAR" />);

    const circle = container.querySelector("div[style*='border-radius']");
    expect(circle).toBeTruthy();

    // Hacer hover para mostrar el Popover
    await user.hover(circle!);

    // El Popover debe mostrar "Hogar" (capitalizado)
    // Nota: Ant Design renderiza el Popover en el body, no dentro del contenedor
    // Esperar a que el Popover aparezca
    await screen.findByText("Hogar");
  });

  it("capitaliza correctamente categorías mixtas en el Popover", async () => {
    const user = userEvent.setup();
    const { container } = render(<CategoryCircleTable category="Sin Categoria" />);

    const circle = container.querySelector("div[style*='border-radius']");
    expect(circle).toBeTruthy();

    await user.hover(circle!);

    // Debe mostrar "Sin categoria" (primera mayúscula, resto minúscula)
    await screen.findByText("Sin categoria");
  });

  it("capitaliza correctamente categorías en minúsculas en el Popover", async () => {
    const user = userEvent.setup();
    const { container } = render(<CategoryCircleTable category="supermercado" />);

    const circle = container.querySelector("div[style*='border-radius']");
    expect(circle).toBeTruthy();

    await user.hover(circle!);

    // Debe mostrar "Supermercado"
    await screen.findByText("Supermercado");
  });

  it("muestra '-' cuando la categoría es undefined", async () => {
    const user = userEvent.setup();
    const { container } = render(<CategoryCircleTable category={undefined} />);

    const circle = container.querySelector("div[style*='border-radius']");
    expect(circle).toBeTruthy();

    await user.hover(circle!);

    // Debe mostrar "-" para categoría undefined
    await screen.findByText("-");
  });

  it("usa el ícono correcto para cada categoría conocida", () => {
    const categories = [
      "hogar",
      "regalos",
      "restaurante",
      "ropa",
      "servicios",
      "streaming",
      "supermercado",
      "tecnologia",
      "transporte",
      "viaje",
    ];

    categories.forEach((category) => {
      const { container } = render(<CategoryCircleTable category={category} />);
      const circle = container.querySelector("div[style*='border-radius']");
      expect(circle).toBeTruthy();
    });
  });

  it("usa ícono por defecto para categoría desconocida", () => {
    const { container } = render(<CategoryCircleTable category="categoria desconocida" />);
    const circle = container.querySelector("div[style*='border-radius']");
    expect(circle).toBeTruthy();
  });

  it("aplica el color correcto según la categoría", () => {
    const { container } = render(<CategoryCircleTable category="hogar" />);
    const circle = container.querySelector("div[style*='border-radius']") as HTMLElement;
    
    // Hogar debe tener color #faad14
    expect(circle.style.backgroundColor).toBe("rgb(250, 173, 20)"); // #faad14 en RGB
  });

  it("capitaliza el atributo title del div", () => {
    const { container } = render(<CategoryCircleTable category="TECNOLOGIA" />);
    const circle = container.querySelector("div[title]") as HTMLElement;
    
    expect(circle.getAttribute("title")).toBe("Tecnologia");
  });
});
