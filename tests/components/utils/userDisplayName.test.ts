import { describe, it, expect } from "vitest";
import { getUserDisplayName } from "../../../src/components/utils/userDisplayName";

describe("getUserDisplayName", () => {
  it("retorna nombre completo cuando tiene givenName y familyName", () => {
    const user = {
      givenName: "Matias",
      familyName: "Ferrero Vilas",
      email: "matigfv@gmail.com",
    };
    expect(getUserDisplayName(user)).toBe("Matias Ferrero Vilas");
  });

  it("retorna solo givenName cuando no tiene familyName", () => {
    const user = {
      givenName: "Matias",
      familyName: null,
      email: "matigfv@gmail.com",
    };
    expect(getUserDisplayName(user)).toBe("Matias");
  });

  it("retorna solo givenName cuando familyName es undefined", () => {
    const user = {
      givenName: "Matias",
      email: "matigfv@gmail.com",
    };
    expect(getUserDisplayName(user)).toBe("Matias");
  });

  it("retorna email cuando no tiene givenName", () => {
    const user = {
      givenName: null,
      familyName: "Ferrero Vilas",
      email: "matigfv@gmail.com",
    };
    expect(getUserDisplayName(user)).toBe("matigfv@gmail.com");
  });

  it("retorna email cuando givenName es undefined", () => {
    const user = {
      email: "matigfv@gmail.com",
    };
    expect(getUserDisplayName(user)).toBe("matigfv@gmail.com");
  });

  it("retorna email cuando givenName es string vacío", () => {
    const user = {
      givenName: "",
      familyName: "Ferrero Vilas",
      email: "matigfv@gmail.com",
    };
    expect(getUserDisplayName(user)).toBe("matigfv@gmail.com");
  });

  it("retorna string vacío cuando no tiene ningún dato", () => {
    const user = {
      givenName: null,
      familyName: null,
      email: null,
    };
    expect(getUserDisplayName(user)).toBe("");
  });

  it("retorna string vacío cuando el objeto está vacío", () => {
    const user = {};
    expect(getUserDisplayName(user)).toBe("");
  });

  it("trimea espacios extra en el nombre completo", () => {
    const user = {
      givenName: "Matias",
      familyName: "  ",
      email: "matigfv@gmail.com",
    };
    expect(getUserDisplayName(user)).toBe("Matias");
  });
});
