// @ts-check
import fs from "node:fs";
import path from "node:path";

/**
 * Validates and syncs skills in plugins/neemseo/skills across Claude, Codex, and Cursor manifests.
 */
function syncPluginSkills() {
  const isCheckMode = process.argv.includes("--check");
  const pluginDir = path.resolve(process.cwd(), "plugins/neemseo");
  const skillsDir = path.join(pluginDir, "skills");

  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
  }

  const skillFiles = fs.readdirSync(skillsDir).filter((f) => f.endsWith(".md"));

  const manifests = [
    { name: "claude.json", path: path.join(pluginDir, "claude.json") },
    { name: "codex.json", path: path.join(pluginDir, "codex.json") },
    { name: "cursor.json", path: path.join(pluginDir, "cursor.json") },
  ];

  let hasDiff = false;

  for (const manifest of manifests) {
    let currentData = { name: "neemseo", version: "0.1.0", skills: [] };
    if (fs.existsSync(manifest.path)) {
      try {
        currentData = JSON.parse(fs.readFileSync(manifest.path, "utf8"));
      } catch {
        // ignore parse error
      }
    }

    const expectedData = {
      ...currentData,
      name: "neemseo",
      version: "0.1.0",
      skills: skillFiles.map((filename) => {
        const id = path.basename(filename, ".md");
        return {
          id,
          file: `skills/${filename}`,
        };
      }),
    };

    const expectedJson = JSON.stringify(expectedData, null, 2) + "\n";
    const existingJson = fs.existsSync(manifest.path) ? fs.readFileSync(manifest.path, "utf8") : "";

    if (expectedJson !== existingJson) {
      hasDiff = true;
      if (isCheckMode) {
        console.error(
          `[SYNC-CHECK] Manifest ${manifest.name} is out of sync with skills directory.`
        );
      } else {
        fs.writeFileSync(manifest.path, expectedJson, "utf8");
        console.log(`[SYNC] Updated ${manifest.name}`);
      }
    }
  }

  if (isCheckMode && hasDiff) {
    console.error("Plugin skills check failed: manifests are out of sync.");
    process.exit(1);
  } else {
    console.log("Plugin skills are properly synchronized.");
  }
}

syncPluginSkills();
