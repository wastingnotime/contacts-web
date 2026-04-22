import { startContactsWebBffServer } from "./server.ts";

const { port, server } = await startContactsWebBffServer();
console.log(`contacts-web BFF listening on http://127.0.0.1:${port}`);

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
