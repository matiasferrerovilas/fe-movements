window.env = {
  environment: "production",
  keycloak: {
    clientId: "fe-movements",
    realm: "m2",
    url: "https://auth.eva-core.com",
  },
  backend: {
    api: "https://movement.eva-core.com/v1",
    websocketUrl: "https://movement.eva-core.com",
  },
  // Crash reporting opcional (ver src/config/sentry.ts) — dejar undefined lo desactiva.
  sentryDsn: undefined,
};
