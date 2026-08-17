// Los logs de los flujos de auth (Root.tsx, AxiosInterceptorProvider.tsx) son útiles en desarrollo
// pero no deberían aparecer en la consola de producción para usuarios finales.
export const logger = {
  debug: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.debug(...args);
  },
  error: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.error(...args);
  },
};
