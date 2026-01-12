import type { Tool } from "@openrouter/sdk";

/**
 * Task execution result
 */
export interface TaskResult {
  taskName: string;
  success: boolean;
  error?: string;
  outputPath: string;
  metadata?: Record<string, unknown>;
}

/**
 * Task definition
 */
export interface Task {
  /** Unique identifier for the task */
  name: string;

  /** Description of what the task evaluates */
  description: string;

  /** The prompt to send to the model */
  prompt: string;

  /** Factory function to create tools with the given working directory */
  createTools: (workdir: string) => Tool<any, any>[];

  /** Task type: one-shot or multi-turn */
  type: "one-shot" | "multi-turn";

  /**
   * Validate and process the task result
   * @param outputDir Directory where task outputs are stored
   * @returns Task result with success/error information
   */
  validate(outputDir: string): Promise<TaskResult>;
}

/**
 * Task registry - maps task names to task definitions
 */
export type TaskRegistry = Record<string, Task>;
