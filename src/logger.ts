import winston from "winston";

// =============  Creating Logger ==================

const log = winston.createLogger({
  level: "info",
  format: winston.format.json(),
});

if (process.env.NODE_ENV !== "production") {
  log.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export { log };
