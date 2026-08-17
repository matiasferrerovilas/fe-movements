import { Component, type ErrorInfo, type ReactNode } from "react";
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
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReload={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}
