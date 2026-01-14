import { OpenRouter } from "@openrouter/sdk";
import { type SDKOptions } from "@openrouter/sdk";
import { mkdir, readdir } from "fs/promises";
import { join } from "path";
import type { Task, TaskResult } from "./types.js";
import { generateRunDirectoryName } from "./utils.js";

/**
 * Dynamically load all tasks from the evals/tasks directory
 */
async function loadTasks(): Promise<Map<string, Task>> {
  const tasks = new Map<string, Task>();
  const tasksDir = join(process.cwd(), "evals", "tasks");

  try {
    const files = await readdir(tasksDir);
    const taskFiles = files.filter((file) => file.endsWith(".ts"));

    for (const file of taskFiles) {
      const filePath = join(tasksDir, file);
      try {
        const module = await import(filePath);

        // Find the exported task (should be a single Task export)
        const taskExport = Object.values(module).find(
          (value): value is Task =>
            typeof value === "object" &&
            value !== null &&
            "name" in value &&
            "description" in value &&
            "type" in value &&
            "prompt" in value &&
            "createTools" in value &&
            "validate" in value,
        );

        if (taskExport) {
          tasks.set(taskExport.name, taskExport);
        } else {
          console.warn(`⚠️  No valid task found in ${file}`);
        }
      } catch (error) {
        console.error(`❌ Failed to load task from ${file}:`, error);
      }
    }
  } catch (error) {
    console.error(`❌ Failed to read tasks directory:`, error);
    throw new Error(`Could not load tasks from ${tasksDir}`);
  }

  return tasks;
}

/**
 * Get all task names
 */
async function getTaskNames(): Promise<string[]> {
  const tasks = await loadTasks();
  return Array.from(tasks.keys());
}

/**
 * Get a specific task by name
 */
async function getTask(name: string): Promise<Task> {
  const tasks = await loadTasks();
  const task = tasks.get(name);

  if (!task) {
    const availableTasks = Array.from(tasks.keys()).join(", ");
    throw new Error(
      `Task "${name}" not found. Available tasks: ${availableTasks}`,
    );
  }

  return task;
}

/**
 * Check if a task exists
 */
async function hasTask(name: string): Promise<boolean> {
  const tasks = await loadTasks();
  return tasks.has(name);
}

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
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  /**
  * 
  * 
   */
  const client = new OpenRouter({
    apiKey,
    httpReferer: "https://gaunt-sloth-assistant.github.io/",
    xTitle: "Gaunt Sloth Assistant",
  });

  // Determine which tasks to run
  const tasksToRun: string[] = taskName ? [taskName] : await getTaskNames();

  // Validate task names
  for (const name of tasksToRun) {
    if (!(await hasTask(name))) {
      const availableTasks = await getTaskNames();
      throw new Error(
        `Unknown task: ${name}. Available tasks: ${availableTasks.join(", ")}`,
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
    const task = await getTask(name);
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
  console.log(
    `Success rate: ${((successCount / results.length) * 100).toFixed(1)}%`,
  );
  console.log(`${"=".repeat(60)}\n`);
}
