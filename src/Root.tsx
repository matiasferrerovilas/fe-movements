import { StrictMode, useState } from "react";
import Keycloak from "keycloak-js";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import App from "@/App";
import { AuthProvider } from "@/apis/auth/AuthProvider";
import Forbidden from "@/components/Forbidden";
import { logger } from "@/utils/logger";

const keycloak = new Keycloak(window.env.keycloak);

const loadingIndicator = (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "18px",
    }}
  >
    Cargando...
  </div>
);

export default function Root() {
  const [authFailed, setAuthFailed] = useState(false);

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        checkLoginIframe: false,
        enableLogging: false,
        onLoad: "login-required",
        pkceMethod: "S256",
      }}
      LoadingComponent={
        authFailed ? <Forbidden onRetry={() => keycloak.login()} /> : loadingIndicator
      }
      onEvent={(event, error) => {
        if (event === "onInitError" || event === "onAuthError") {
          logger.error("Error de autenticación:", error);
          setAuthFailed(true);
        }
        if (event === "onAuthSuccess") {
          logger.debug("Autenticación exitosa");
        }
      }}
    >
      <StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StrictMode>
    </ReactKeycloakProvider>
  );
}
