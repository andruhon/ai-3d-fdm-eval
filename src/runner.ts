import { OpenRouter } from "@openrouter/sdk";
import { mkdir } from "fs/promises";
import { join } from "path";
import type { Task, TaskResult } from "./types.js";
import { generateRunDirectoryName } from "./utils.js";
import { getTask, getTaskNames, hasTask } from "../evals/tasks/index.js";

/**
 * Run a single task evaluation
 */
export async function runTask(
  client: OpenRouter,
  modelName: string,
  task: Task,
  outputDir: string,
): Promise<TaskResult> {
  try {
    console.log(`\n📋 Running task: ${task.name}`);
    console.log(`   Description: ${task.description}`);
    console.log(`   Type: ${task.type}`);
    console.log(`   Model: ${modelName}`);

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Create tools with the task's output directory as workdir
    const tools = task.createTools(outputDir);

    // Run the model
    console.log(`\n🤖 Calling model...`);
    const response = client.callModel({
      model: modelName,
      input: task.prompt,
      tools,
    });

    const text = await response.getText();
    console.log(`\n📝 Model response:\n${text}\n`);

    // Validate the result
    console.log(`\n✅ Validating task output...`);
    const result = await task.validate(outputDir);

    if (result.success) {
      console.log(`✅ Task completed successfully!`);
    } else {
      console.log(`❌ Task failed: ${result.error}`);
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error running task: ${errorMessage}`);
    return {
      taskName: task.name,
      success: false,
      error: errorMessage,
      outputPath: outputDir,
    };
  }
}

/**
 * Run evaluation(s)
 */
export async function runEvaluation(
  modelName: string,
  taskName?: string,
): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is not set",
    );
  }

  const client = new OpenRouter({ apiKey });

  // Determine which tasks to run
  const tasksToRun: string[] = taskName
    ? [taskName]
    : getTaskNames();

  // Validate task names
  for (const name of tasksToRun) {
    if (!hasTask(name)) {
      throw new Error(
        `Unknown task: ${name}. Available tasks: ${getTaskNames().join(", ")}`,
      );
    }
  }

  // Create run directory
  const runDir = join("evals", "results", generateRunDirectoryName(modelName));
  await mkdir(runDir, { recursive: true });

  console.log(`\n🚀 Starting evaluation`);
  console.log(`   Model: ${modelName}`);
  console.log(`   Tasks: ${tasksToRun.join(", ")}`);
  console.log(`   Output: ${runDir}\n`);

  const results: TaskResult[] = [];

  // Run each task
  for (const name of tasksToRun) {
    const task = getTask(name);
    const taskOutputDir = join(runDir, name);

    const result = await runTask(client, modelName, task, taskOutputDir);
    results.push(result);
  }

  // Print summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 EVALUATION SUMMARY`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Model: ${modelName}`);
  console.log(`Run directory: ${runDir}`);
  console.log(`\nResults:`);

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  for (const result of results) {
    const status = result.success ? "✅ PASS" : "❌ FAIL";
    console.log(`  ${status} ${result.taskName}`);
    if (!result.success && result.error) {
      console.log(`         Error: ${result.error}`);
    }
  }

  console.log(`\nTotal: ${results.length} tasks`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Success rate: ${((successCount / results.length) * 100).toFixed(1)}%`);
  console.log(`${"=".repeat(60)}\n`);
}
