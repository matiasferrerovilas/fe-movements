import { Component, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { logger } from "@/utils/logger";
import { ErrorFallback } from "@/components/ErrorFallback";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Red de contención de último recurso: sin esto, cualquier error de render en cualquier
 * pantalla deja la app en blanco (React desmonta el árbol entero al no poder recuperarse
 * de un error no atrapado). Solo un class component puede implementar un error boundary —
 * no existe equivalente en hooks.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Error no controlado en el árbol de React:", error, errorInfo.componentStack);
    // No-op si Sentry no está inicializado (sin sentryDsn configurado) — ver config/sentry.ts.
    // A diferencia de logger.error, esto se reporta también en producción, que es el único
    // momento en que un crash sin rastro le pasa a un usuario real en vez de a alguien mirando
    // la consola de dev.
    Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReload={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}
