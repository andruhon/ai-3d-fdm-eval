/**
 * Model mesh evaluation runner
 * 
 * Runs evaluations for all models defined in models-config.json
 * against either a specific task or all available tasks.
 */

import { runEvaluation } from "./runner.js";
import { readFile } from "fs/promises";
import { join } from "path";

interface ModelsConfig {
  models: string[];
  metadata?: {
    description?: string;
    lastUpdated?: string;
  };
}

interface MeshResult {
  model: string;
  task: string;
  success: boolean;
  error?: string;
}

/**
 * Load models configuration
 */
async function loadModelsConfig(): Promise<ModelsConfig> {
  const configPath = join(process.cwd(), "models-config.json");
  try {
    const content = await readFile(configPath, "utf-8");
    return JSON.parse(content) as ModelsConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Models configuration not found at: ${configPath}`);
    }
    throw new Error(`Failed to load models config: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Run a single model evaluation and capture result
 */
async function runModelEval(
  model: string,
  taskName: string | undefined,
  verbose: boolean
): Promise<MeshResult[]> {
  const results: MeshResult[] = [];
  const taskLabel = taskName || "all tasks";

  console.log("==================================================");
  console.log(`🚀 Running: ${model}`);
  console.log(`   Task: ${taskLabel}`);
  console.log("==================================================");

  try {
    await runEvaluation(model, taskName);
    results.push({
      model,
      task: taskLabel,
      success: true,
    });
    console.log(`✅ Success: ${model} (${taskLabel})`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({
      model,
      task: taskLabel,
      success: false,
      error: errorMsg,
    });
    console.error(`❌ Failed: ${model} (${taskLabel})`);
    if (verbose) {
      console.error(`   Error: ${errorMsg}`);
    }
  }

  console.log("");
  return results;
}

/**
 * Print summary of results
 */
function printSummary(allResults: MeshResult[]): void {
  const successCount = allResults.filter((r) => r.success).length;
  const failCount = allResults.filter((r) => !r.success).length;

  console.log("==================================================");
  console.log("📊 MESH EVALUATION SUMMARY");
  console.log("==================================================");
  console.log(`Total evaluations: ${allResults.length}`);
  console.log(`Successful:        ${successCount}`);
  console.log(`Failed:            ${failCount}`);

  if (failCount > 0) {
    console.log("");
    console.log("Failed evaluations:");
    for (const result of allResults.filter((r) => !r.success)) {
      console.log(`  ❌ ${result.model} (${result.task})`);
      if (result.error) {
        console.log(`     ${result.error}`);
      }
    }
  }

  if (failCount === 0) {
    console.log("");
    console.log("✅ All evaluations completed successfully!");
  }
}

/**
 * Run mesh evaluation across all configured models
 */
export async function runMeshEvaluation(
  taskName: string | undefined,
  verbose: boolean
): Promise<void> {
  console.log("==================================================");
  console.log("🔬 MODEL MESH EVALUATION");
  console.log("==================================================");
  console.log("");

  // Load models configuration
  const config = await loadModelsConfig();
  
  console.log(`Models to evaluate: ${config.models.length}`);
  if (config.metadata?.description) {
    console.log(`Description: ${config.metadata.description}`);
  }
  console.log("");

  for (const model of config.models) {
    console.log(`  - ${model}`);
  }
  console.log("");

  if (taskName) {
    console.log(`Task filter: ${taskName}`);
  } else {
    console.log("Running all available tasks for each model");
  }
  console.log("");

  // Run evaluations for all models
  const allResults: MeshResult[] = [];
  
  for (const model of config.models) {
    const results = await runModelEval(model, taskName, verbose);
    allResults.push(...results);
  }

  // Print summary
  printSummary(allResults);

  // Exit with error code if any failures
  const hasFailures = allResults.some((r) => !r.success);
  if (hasFailures) {
    process.exit(1);
  }
}
