import { useState, useEffect, useRef } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { AuthContext } from "./AuthContext";
import type { AuthContextState } from "./AuthContext";
import { api } from "../axios";
import type { CurrentUser } from "../../models/CurrentUser";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { keycloak } = useKeycloak();

  const [state, setState] = useState<
    Omit<AuthContextState, "completeOnboarding">
  >({
    authenticated: false,
    firstLogin: false,
    loading: true,
  });

  const fetchedRef = useRef(false);

  const completeOnboarding = () => {
    setState((prev) => ({ ...prev, firstLogin: false }));
  };

  useEffect(() => {
    if (!keycloak) return;

    if (!keycloak.authenticated) {
      fetchedRef.current = false;
      const resetState = async () => {
        setState({
          authenticated: false,
          firstLogin: false,
          loading: false,
        });
      };
      resetState();
      return;
    }

    const loadUserState = async () => {
      setState((s) => ({ ...s, loading: true }));
      try {
        const currentUser = await api
          .get<CurrentUser>("/users/me")
          .then((r) => r.data);
        setState({
          authenticated: true,
          firstLogin: currentUser.isFirstLogin,
          loading: false,
        });
      } catch {
        setState({
          authenticated: true,
          firstLogin: false,
          loading: false,
        });
      }
    };

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      loadUserState();
    }
  }, [keycloak?.authenticated]);

  return (
    <AuthContext.Provider value={{ ...state, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}
