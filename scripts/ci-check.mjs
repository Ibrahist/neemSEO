// @ts-check
import { execSync } from "node:child_process";

/**
 * Runs all CI checks locally so developers can reproduce CI with one command.
 */
function runCiCheck() {
  console.log("=== neemSEO Local CI Check ===");

  const steps = [
    { name: "Prettier Check", cmd: "pnpm format:check" },
    { name: "TypeScript Check", cmd: "pnpm typecheck" },
    { name: "ESLint", cmd: "pnpm lint" },
    { name: "Unit Tests", cmd: "pnpm test" },
    { name: "Skills Manifest Sync Check", cmd: "pnpm sync-plugin-skills -- --check" },
  ];

  let hasErrors = false;

  for (const step of steps) {
    console.log(`\n--> Running: ${step.name} (${step.cmd})`);
    try {
      execSync(step.cmd, { stdio: "inherit" });
      console.log(`✓ ${step.name} passed.`);
    } catch {
      console.error(`✗ ${step.name} failed!`);
      hasErrors = true;
      break;
    }
  }

  if (hasErrors) {
    console.error("\n❌ CI check failed. Fix errors above before pushing.");
    process.exit(1);
  } else {
    console.log("\n✅ All CI checks passed successfully!");
  }
}

runCiCheck();
