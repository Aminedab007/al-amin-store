// server/src/middlewares/logger.ts
import morgan from "morgan";

export const logger = morgan(
  ":method :url :status :res[content-length] - :response-time ms"
);
