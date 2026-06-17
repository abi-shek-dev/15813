export function createLogger({ level = "INFO", source = "frontend" } = {}) {
  const shouldLog = (messageLevel) => {
    const levels = ["DEBUG", "INFO", "WARN", "ERROR"];
    return levels.indexOf(messageLevel) >= levels.indexOf(level);
  };

  return ({ packageName, message, level: messageLevel = "INFO", meta = {} }) => {
    if (!shouldLog(messageLevel)) return;

    const payload = {
      timestamp: new Date().toISOString(),
      source,
      packageName,
      level: messageLevel,
      message,
      ...meta,
    };

    const formatted = `[${payload.source}/${payload.packageName}] ${payload.level}: ${payload.message}`;

    if (messageLevel === "ERROR" || messageLevel === "WARN") {
      console.error(formatted, payload);
    } else {
      console.log(formatted, payload);
    }
  };
}
