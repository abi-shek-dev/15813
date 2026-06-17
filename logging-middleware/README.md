# Logging Middleware

This package provides a shared logger factory for the Afford-Med frontend and backend.

Usage from the frontend:

```js
import { Log } from "./src/utils/logger";

Log("frontend", "INFO", "notifications.api", "API request started", {
  page,
  filterType,
});
```

Usage from the middleware package directly:

```js
import { createLogger } from "./index.js";
const log = createLogger({ level: "DEBUG", source: "frontend" });
log({ packageName: "notifications.api", level: "INFO", message: "API request started" });
```

Install locally from `notification-app-fe` with:

```bash
npm install
```
