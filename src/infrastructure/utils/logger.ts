// infrastructure/utils/logger.js
import { createLogger, format, transports } from "winston";
import path from "path";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: path.resolve("logs/debug.log"), level: "debug" }),
    new transports.File({ filename: path.resolve("logs/combined.log") }),
    new transports.Console({ format: format.simple() })
  ],
});

export default logger;
