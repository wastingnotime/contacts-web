import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

function readRepoFile(relativePath) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

describe("ci-web-docker workflow", () => {
  it("dispatches the production candidate to integration-sandbox instead of opening infra-platform PRs", () => {
    const workflow = readRepoFile(".github/workflows/ci-web-docker.yml");

    expect(workflow).toContain("repos/${TARGET_REPOSITORY}/dispatches");
    expect(workflow).toContain("EVENT_TYPE: contacts-web-production-candidate");
    expect(workflow).toContain('client_payload[service]="contacts-web"');
    expect(workflow).toContain('client_payload[spa_image_uri]="${SPA_IMAGE_URI}"');
    expect(workflow).toContain('client_payload[bff_image_uri]="${BFF_IMAGE_URI}"');
    expect(workflow).not.toContain("wastingnotime/infra-platform");
    expect(workflow).not.toContain("gh pr create");
    expect(workflow).not.toContain("checkout infrastructure repo");
    expect(workflow).not.toContain("open infrastructure pull request");
  });
});
