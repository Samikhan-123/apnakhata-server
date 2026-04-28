import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import dotenv from "dotenv";

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,

  // Filter out noisy validation/client errors from Sentry
  beforeSend(event, hint) {
    const error = hint.originalException as any;

    // Ignore validation errors (400), unauthorized (401), etc.
    // We only care about level 500 errors in Sentry
    if (
      error &&
      (error.name === "ZodError" ||
        (error.statusCode && error.statusCode < 500) ||
        error.message?.includes("Validation"))
    ) {
      return null;
    }

    return event;
  },
});
