import { describe, test, expect } from "bun:test";
import { generateRunDirectoryName, type CameraParams } from "../src/utils";
import { readdir } from "fs/promises";
import { join } from "path";
import type { Task } from "../src/types";

describe("Task Loading", () => {
  test("should have task files in evals/tasks directory", async () => {
    const tasksDir = join(process.cwd(), "evals", "tasks");
    const files = await readdir(tasksDir);
    const taskFiles = files.filter(file => file.endsWith(".ts"));
    
    expect(taskFiles.length).toBeGreaterThan(0);
    expect(taskFiles).toContain("001-rivet-zero-shot.ts");
  });

  test("should dynamically import rivet task", async () => {
    const taskPath = join(process.cwd(), "evals", "tasks", "001-rivet-zero-shot.ts");
    const module = await import(taskPath);
    
    const task = Object.values(module).find(
      (value): value is Task =>
        typeof value === "object" &&
        value !== null &&
        "name" in value
    ) as Task;
    
    expect(task).toBeDefined();
    expect(task.name).toBe("rivet");
    expect(task.type).toBe("zero-shot");
    expect(task.description).toBeTruthy();
    expect(task.prompt).toBeTruthy();
    expect(task.createTools).toBeDefined();
    expect(typeof task.createTools).toBe("function");
    
    // Test that createTools returns an array
    const tools = task.createTools("/tmp/test");
    expect(Array.isArray(tools)).toBe(true);
  });
});

describe("Utils", () => {
  test("generateRunDirectoryName should create valid directory name", () => {
    const name = generateRunDirectoryName("anthropic/claude-3.5-sonnet");
    
    // Should match pattern: run-YYYYMMDD-HHMMSS-{model}
    expect(name).toMatch(/^run-\d{8}-\d{6}-anthropic-claude-3\.5-sonnet$/);
    
    // Should replace slashes with dashes
    expect(name).not.toContain("/");
  });

  test("generateRunDirectoryName should handle model names without slashes", () => {
    const name = generateRunDirectoryName("gpt-4");
    expect(name).toMatch(/^run-\d{8}-\d{6}-gpt-4$/);
  });

  test("CameraParams type should be defined", () => {
    const camera: CameraParams = {
      translation: [0, 0, 0],
      rotation: [-35.264, 0, 45],
    };
    expect(camera.translation).toEqual([0, 0, 0]);
    expect(camera.rotation).toEqual([-35.264, 0, 45]);
  });
});
