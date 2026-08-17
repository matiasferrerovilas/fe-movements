import { describe, it, expect } from "vitest";
import i18n from "@/i18n/config";
import { getEntityLabels } from "@/utils/entityLabels";
import { UserTypeEnum } from "@/enums/UserTypeEnum";

const t = i18n.t.bind(i18n);

describe("getEntityLabels", () => {
  it("retorna labels de CONSUMER cuando userType es PERSONAL", () => {
    const labels = getEntityLabels(UserTypeEnum.PERSONAL, t);

    expect(labels.workspace).toBe("Workspace");
    expect(labels.workspacePlaceholder).toContain("Familia");
    expect(labels.ingresoLabel).toContain("sueldo mensual");
    expect(labels.miembro).toBe("Miembro");
    expect(labels.bancosSubtitle).toContain("lista personal");
    expect(labels.categoriasSubtitle).toContain("categorías personales");
    expect(labels.userTypeDisplay).toBe("Personal");
    expect(labels.tus).toBe("tus");
  });

  it("retorna labels de COMPANY cuando userType es ENTERPRISE", () => {
    const labels = getEntityLabels(UserTypeEnum.ENTERPRISE, t);

    expect(labels.workspace).toBe("Espacio de trabajo");
    expect(labels.workspacePlaceholder).toContain("Proyecto");
    expect(labels.ingresoLabel).toContain("ingreso mensual estimado");
    expect(labels.miembro).toBe("Colaborador");
    expect(labels.bancosSubtitle).toContain("cuentas bancarias de la empresa");
    expect(labels.categoriasSubtitle).toContain("gastos del negocio");
    expect(labels.userTypeDisplay).toBe("Empresa");
    expect(labels.tus).toBe("los");
  });

  it("retorna labels de CONSUMER cuando userType es null (fallback)", () => {
    const labels = getEntityLabels(null, t);

    expect(labels.workspace).toBe("Workspace");
    expect(labels.ingresoLabel).toContain("sueldo mensual");
    expect(labels.userTypeDisplay).toBe("Personal");
  });

  it("retorna un objeto con todos los campos esperados", () => {
    const labels = getEntityLabels(UserTypeEnum.PERSONAL, t);

    // Verificar que existan los campos principales
    expect(labels).toHaveProperty("workspace");
    expect(labels).toHaveProperty("workspaces");
    expect(labels).toHaveProperty("miembro");
    expect(labels).toHaveProperty("miembros");
    expect(labels).toHaveProperty("ingresoLabel");
    expect(labels).toHaveProperty("bancosSubtitle");
    expect(labels).toHaveProperty("categoriasSubtitle");
    expect(labels).toHaveProperty("userTypeDisplay");
    expect(labels).toHaveProperty("tourBalance");
    expect(labels).toHaveProperty("tourGastos");
    expect(labels).toHaveProperty("workspaceCrear");
    expect(labels).toHaveProperty("workspaceNuevo");
    expect(labels).toHaveProperty("miembroInvitar");
    expect(labels).toHaveProperty("onboardingBienvenida");

    // Verificar que todos son strings
    Object.values(labels).forEach((value) => {
      expect(typeof value).toBe("string");
    });
  });
});
