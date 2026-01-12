import { runEvaluation } from "./src/runner.js";
import { runMeshEvaluation } from "./src/mesh-runner.js";

/**
 * Parse command-line arguments
 */
function parseArgs(): {
  meshMode: boolean;
  modelName?: string;
  taskName?: string;
  verbose: boolean;
} {
  const args = process.argv.slice(2);
  let meshMode = false;
  let modelName: string | undefined;
  let taskName: string | undefined;
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === "--mesh") {
      meshMode = true;
    } else if (arg === "--verbose" || arg === "-v") {
      verbose = true;
    } else if (!arg.startsWith("-")) {
      if (!modelName) {
        modelName = arg;
      } else if (!taskName) {
        taskName = arg;
      }
    }
  }

  return { meshMode, modelName, taskName, verbose };
}

/**
 * Print usage information
 */
function printUsage(): void {
  console.error("Usage:");
  console.error("  Single model:  bun run index.ts <model-name> [task-name] [--verbose]");
  console.error("  Model mesh:    bun run index.ts --mesh [task-name] [--verbose]");
  console.error("");
  console.error("Examples:");
  console.error("  bun run index.ts anthropic/claude-4.5-sonnet");
  console.error("  bun run index.ts anthropic/claude-4.5-sonnet rivet");
  console.error("  bun run index.ts --mesh");
  console.error("  bun run index.ts --mesh rivet");
  console.error("  bun run index.ts --mesh rivet --verbose");
  console.error("");
  console.error("Options:");
  console.error("  --mesh         Run evaluation mesh across all models in models-config.json");
  console.error("  --verbose, -v  Show detailed error messages");
  console.error("");
  console.error("If task-name is not provided, all tasks will be run.");
}

/**
 * Main entry point
 */
async function main() {
  try {
    const { meshMode, modelName, taskName, verbose } = parseArgs();

    if (meshMode) {
      // Run mesh evaluation
      await runMeshEvaluation(taskName, verbose);
    } else {
      // Run single model evaluation
      if (!modelName) {
        printUsage();
        process.exit(1);
      }
      await runEvaluation(modelName, taskName);
    }
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.main) {
  main();
}
