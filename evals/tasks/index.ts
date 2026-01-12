import type { TaskRegistry } from "../../src/types.js";
import { rivetTask } from "./rivet.js";

/**
 * Registry of all available evaluation tasks
 */
export const tasks: TaskRegistry = {
  rivet: rivetTask,
};

/**
 * Get a task by name
 */
export function getTask(name: string) {
  return tasks[name];
}

/**
 * Get all task names
 */
export function getTaskNames(): string[] {
  return Object.keys(tasks);
}

/**
 * Check if a task exists
 */
export function hasTask(name: string): boolean {
  return name in tasks;
}
