import { useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { keycloak } = useKeycloak();

  const [state, setState] = useState({ authenticated: false, loading: true });

  useEffect(() => {
    if (!keycloak) return;

    if (!keycloak.authenticated) {
      setState({ authenticated: false, loading: false });
      return;
    }

    setState({ authenticated: true, loading: false });
  }, [keycloak?.authenticated, keycloak]);

  return (
    <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
  );
}
