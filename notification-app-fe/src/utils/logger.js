import { createLogger } from "../../../logging-middleware/index.js";

export const Log = createLogger({ level: "DEBUG", source: "frontend" });
