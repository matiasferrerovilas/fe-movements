import { describe, it, expect } from "vitest";
import { getServiceLabels } from "../../../src/components/utils/serviceLabels";
import { UserTypeEnum } from "../../../src/enums/UserTypeEnum";

describe("getServiceLabels", () => {
  it("retorna labels de 'Servicios' cuando userType es CONSUMER", () => {
    const labels = getServiceLabels(UserTypeEnum.CONSUMER);

    expect(labels.singular).toBe("Servicio");
    expect(labels.singularLower).toBe("servicio");
    expect(labels.plural).toBe("Servicios");
    expect(labels.pluralLower).toBe("servicios");
    expect(labels.nuevo).toBe("Nuevo Servicio");
    expect(labels.agregar).toBe("Agregar Servicio");
    expect(labels.total).toBe("Total Servicios");
    expect(labels.registrados).toBe("servicios registrados");
    expect(labels.alDia).toBe("servicios al día");
    expect(labels.pendientes).toBe("servicios pendientes");
    expect(labels.eliminar).toBe("¿Eliminar el servicio?");
    expect(labels.tourTitle).toBe("Servicios");
    expect(labels.tourDescription).toContain("suscripciones y servicios");
  });

  it("retorna labels de 'Gastos Recurrentes' cuando userType es COMPANY", () => {
    const labels = getServiceLabels(UserTypeEnum.COMPANY);

    expect(labels.singular).toBe("Gasto Recurrente");
    expect(labels.singularLower).toBe("gasto recurrente");
    expect(labels.plural).toBe("Gastos Recurrentes");
    expect(labels.pluralLower).toBe("gastos recurrentes");
    expect(labels.nuevo).toBe("Nuevo Gasto Recurrente");
    expect(labels.agregar).toBe("Agregar Gasto");
    expect(labels.total).toBe("Total Gastos");
    expect(labels.registrados).toBe("gastos registrados");
    expect(labels.alDia).toBe("gastos al día");
    expect(labels.pendientes).toBe("gastos pendientes");
    expect(labels.eliminar).toBe("¿Eliminar el gasto recurrente?");
    expect(labels.tourTitle).toBe("Gastos Recurrentes");
    expect(labels.tourDescription).toContain("gastos operativos");
  });

  it("retorna labels de 'Servicios' cuando userType es null (fallback)", () => {
    const labels = getServiceLabels(null);

    expect(labels.singular).toBe("Servicio");
    expect(labels.plural).toBe("Servicios");
    expect(labels.nuevo).toBe("Nuevo Servicio");
    expect(labels.agregar).toBe("Agregar Servicio");
    expect(labels.total).toBe("Total Servicios");
    expect(labels.tourTitle).toBe("Servicios");
  });

  it("retorna un objeto con todos los campos esperados", () => {
    const labels = getServiceLabels(UserTypeEnum.CONSUMER);

    expect(labels).toHaveProperty("singular");
    expect(labels).toHaveProperty("singularLower");
    expect(labels).toHaveProperty("plural");
    expect(labels).toHaveProperty("pluralLower");
    expect(labels).toHaveProperty("nuevo");
    expect(labels).toHaveProperty("agregar");
    expect(labels).toHaveProperty("total");
    expect(labels).toHaveProperty("registrados");
    expect(labels).toHaveProperty("alDia");
    expect(labels).toHaveProperty("pendientes");
    expect(labels).toHaveProperty("eliminar");
    expect(labels).toHaveProperty("tourTitle");
    expect(labels).toHaveProperty("tourDescription");

    // Verificar que todos son strings
    Object.values(labels).forEach((value) => {
      expect(typeof value).toBe("string");
    });
  });
});
