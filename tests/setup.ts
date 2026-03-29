import "@testing-library/jest-dom";

// Mock window.env for all tests
Object.defineProperty(window, "env", {
  value: {
    backend: {
      api: "http://localhost:8080",
      websocketUrl: "http://localhost:8080",
    },
    keycloak: {
      clientId: "test-client",
      realm: "test-realm",
      url: "http://localhost:8180",
    },
  },
  writable: true,
});

// Polyfill ResizeObserver — not available in jsdom but required by Ant Design
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
