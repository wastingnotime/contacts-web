import { execSync } from "node:child_process";

import {
  createContactsWebProductionImagePublication,
} from "../src/shared/production/contactsWebImagePublication.js";
import {
  writeContactsWebProductionImagePublication,
} from "../src/shared/production/publishContactsWebImagePublication.js";

function resolveGitSha() {
  if (process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA) {
    return process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA;
  }

  return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
}

const gitSha = resolveGitSha();

if (!gitSha) {
  throw new Error("GITHUB_SHA is required to publish production images");
}

const publication = createContactsWebProductionImagePublication({
  spaTag: gitSha,
  bffTag: `bff-${gitSha}`,
});
const result = await writeContactsWebProductionImagePublication({ publication });

process.stdout.write(`${result.content}`);
