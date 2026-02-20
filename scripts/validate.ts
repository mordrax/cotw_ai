/**
 * Validation script for cotw_ai.
 * Runs: typecheck → lint → test
 * Machine-readable output for agent consumption.
 *
 * Usage: bun scripts/validate.ts
 */

const steps = [
  { name: "typecheck", cmd: ["bun", "x", "tsc", "--noEmit"] },
  { name: "lint", cmd: ["bun", "x", "biome", "check", "src/", "tests/"] },
  { name: "test", cmd: ["bun", "x", "vitest", "run"] },
] as const;

interface StepResult {
  name: string;
  passed: boolean;
  duration_ms: number;
  output: string;
}

const results: StepResult[] = [];
let allPassed = true;

for (const step of steps) {
  const start = performance.now();
  const proc = Bun.spawn([...step.cmd], {
    cwd: import.meta.dir + "/..",
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  const duration_ms = Math.round(performance.now() - start);
  const passed = exitCode === 0;

  if (!passed) allPassed = false;

  const output = (stdout + stderr).trim();
  results.push({ name: step.name, passed, duration_ms, output });

  const icon = passed ? "PASS" : "FAIL";
  console.log(`[${icon}] ${step.name} (${duration_ms}ms)`);
  if (!passed) {
    console.log(output);
    console.log();
  }
}

console.log();
console.log(`--- VALIDATION ${allPassed ? "PASSED" : "FAILED"} ---`);
console.log(JSON.stringify(results.map(({ name, passed, duration_ms }) => ({ name, passed, duration_ms }))));

process.exit(allPassed ? 0 : 1);
