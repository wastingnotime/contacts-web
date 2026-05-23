import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

function readRepoFile(relativePath) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

describe("contacts web production delivery artifacts", () => {
  it("keeps the SPA and BFF container artifacts separate", () => {
    const spaDockerfile = readRepoFile("Dockerfile");
    const bffDockerfile = readRepoFile("apps/bff/Dockerfile");
    const nginxConfig = readRepoFile("nginx.conf");

    expect(spaDockerfile).toContain("nginx:1.27-alpine");
    expect(spaDockerfile).toContain("EXPOSE 80");
    expect(spaDockerfile).toContain("HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3");
    expect(spaDockerfile).toContain("http://127.0.0.1/health/ready");
    expect(nginxConfig).toContain("location = /health/live");
    expect(nginxConfig).toContain("location = /health/ready");
    expect(nginxConfig).toContain(`return 200 '{"status":"alive"}';`);
    expect(nginxConfig).toContain(`return 200 '{"status":"ready"}';`);
    expect(bffDockerfile).toContain("FROM golang:1.25-alpine");
    expect(bffDockerfile).toContain("go test ./...");
    expect(bffDockerfile).toContain("go build -o /out/contacts-web-bff ./cmd/bff");
    expect(bffDockerfile).toContain("ENV CONTACTS_WEB_BFF_HOST=0.0.0.0");
    expect(bffDockerfile).toContain("ENV CONTACTS_WEB_BFF_PORT=4010");
    expect(bffDockerfile).toContain("EXPOSE 4010");
    expect(bffDockerfile).toContain("HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3");
    expect(bffDockerfile).toContain("http://127.0.0.1:4010/api/health/ready");
    expect(bffDockerfile).toContain('ENTRYPOINT ["./contacts-web-bff"]');
  });
});
