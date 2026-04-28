import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

function readRepoFile(relativePath) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

describe("ci-web-docker workflow", () => {
  it("keeps infra-platform promotion out of the app repo workflow", () => {
    const workflow = readRepoFile(".github/workflows/ci-web-docker.yml");

    expect(workflow).not.toContain("wastingnotime/infra-platform");
    expect(workflow).not.toContain("gh pr create");
    expect(workflow).not.toContain("checkout infrastructure repo");
    expect(workflow).not.toContain("open infrastructure pull request");
  });
});
