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

    expect(spaDockerfile).toContain("nginx:1.27-alpine");
    expect(spaDockerfile).toContain("EXPOSE 80");
    expect(bffDockerfile).toContain("FROM node:25-alpine");
    expect(bffDockerfile).toContain("ENV CONTACTS_WEB_BFF_HOST=0.0.0.0");
    expect(bffDockerfile).toContain("ENV CONTACTS_WEB_BFF_PORT=4010");
    expect(bffDockerfile).toContain("EXPOSE 4010");
    expect(bffDockerfile).toContain("apps/bff/src/cli.ts");
  });
});
