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

    expect(workflow).toContain("reviewdog/action-actionlint@v1.65.2");
    expect(workflow).toContain("reporter: github-check");
    expect(workflow).toContain("bridgecrewio/checkov-action@v12");
    expect(workflow).toContain("aquasecurity/trivy-action@v0.36.0");
    expect(workflow).toContain("if: ${{ false }}");
    expect(workflow).toContain("upload checkov sarif");
    expect(workflow).toContain("upload trivy sarif");
    expect(workflow).toContain("repos/${TARGET_REPOSITORY}/dispatches");
    expect(workflow).toContain("EVENT_TYPE: candidate-image-updated");
    expect(workflow).toContain('"service": "contacts-web"');
    expect(workflow).toContain('candidate_image="${SPA_IMAGE_URI%:*}"');
    expect(workflow).toContain('"image": "${candidate_image}"');
    expect(workflow).toContain('"sha": "${GITHUB_SHA}"');
    expect(workflow).toContain("checks: write");
    expect(workflow).toContain("security-events: write");
    expect(workflow).not.toContain("wastingnotime/infra-platform");
    expect(workflow).not.toContain("gh pr create");
    expect(workflow).not.toContain("checkout infrastructure repo");
    expect(workflow).not.toContain("open infrastructure pull request");
  });
});
