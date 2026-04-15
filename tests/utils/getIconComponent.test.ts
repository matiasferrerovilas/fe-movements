import { describe, it, expect, vi } from "vitest";
import { getIconComponent } from "../../src/utils/getIconComponent";
import { HomeOutlined, QuestionOutlined, CarOutlined } from "@ant-design/icons";

describe("getIconComponent", () => {
  it("retorna el componente de ícono correcto cuando se proporciona un nombre válido", () => {
    const IconComponent = getIconComponent("HomeOutlined");
    expect(IconComponent).toBe(HomeOutlined);
  });

  it("retorna QuestionOutlined cuando el iconName es null", () => {
    const IconComponent = getIconComponent(null);
    expect(IconComponent).toBe(QuestionOutlined);
  });

  it("retorna QuestionOutlined cuando el iconName es undefined", () => {
    const IconComponent = getIconComponent(undefined);
    expect(IconComponent).toBe(QuestionOutlined);
  });

  it("retorna QuestionOutlined cuando el iconName no existe en Ant Design", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    
    const IconComponent = getIconComponent("IconoInexistente");
    expect(IconComponent).toBe(QuestionOutlined);
    
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Ícono "IconoInexistente" no encontrado en el mapa de iconos. Usando QuestionOutlined por defecto.',
    );
    
    consoleWarnSpy.mockRestore();
  });

  it("retorna el componente correcto para múltiples íconos válidos", () => {
    const icons = [
      { name: "HomeOutlined", expected: HomeOutlined },
      { name: "CarOutlined", expected: CarOutlined },
      { name: "QuestionOutlined", expected: QuestionOutlined },
    ];

    icons.forEach(({ name, expected }) => {
      const IconComponent = getIconComponent(name);
      expect(IconComponent).toBe(expected);
    });
  });

  it("retorna un componente que se puede renderizar con style props", () => {
    const IconComponent = getIconComponent("HomeOutlined");
    expect(IconComponent).toBeTruthy();
    // Los componentes de Ant Design Icons son forwardRef, que son objetos
    expect(typeof IconComponent).toBe("object");
  });
});
