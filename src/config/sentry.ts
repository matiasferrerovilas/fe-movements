import * as Sentry from "@sentry/react";

// Crash reporting is opt-in via window.env.sentryDsn (see config/config.prod.js) so a self-host
// without a Sentry project configured simply doesn't report anywhere instead of failing to build
// or logging noise. Imported for its side effect only, same pattern as src/i18n/config.ts.
const dsn = window.env.sentryDsn;

if (dsn) {
  Sentry.init({ dsn });
}
