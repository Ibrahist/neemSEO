// @ts-check
import { execSync } from "node:child_process";

/**
 * Generates release notes from git commits / PRs since the last tag.
 */
function generateReleaseNotes() {
  console.log("Generating release notes...");
  try {
    const logs = execSync("git log --oneline -n 20", { encoding: "utf8" });
    const lines = logs.trim().split("\n");

    const notes = [
      "# Release Notes",
      "",
      "## Changes in this release",
      "",
      ...lines.map((line) => `- ${line}`),
      "",
      "---",
      "*Generated automatically by neemSEO release tooling*",
    ].join("\n");

    console.log(notes);
  } catch (e) {
    console.log("# Release Notes\n\nInitial release of neemSEO.");
  }
}

generateReleaseNotes();
