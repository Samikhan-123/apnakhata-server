import winston from "winston";

const { combine, timestamp, json, colorize, printf } = winston.format;

// Custom format for local development (pretty-print)
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  if (Object.keys(metadata).length > 0 && level !== "info") {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    process.env.NODE_ENV === "production" ? json() : devFormat,
  ),
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? json()
          : combine(colorize(), devFormat),
    }),
  ],
});

/**
 * Audit Log Helper
 * Use this to log sensitive business actions (e.g., deletions, settings changes)
 */
export const auditLog = (
  action: string,
  userId: string,
  metadata: any = {},
) => {
  logger.info(`[AUDIT]: ${action}`, {
    audit: true,
    userId,
    action,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
};

export default logger;
