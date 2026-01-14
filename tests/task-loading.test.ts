import { describe, expect, test } from "bun:test";
import { readdir } from "fs/promises";
import { join } from "path";
import type { Task } from "../src/types.js";

describe("Dynamic task loading", () => {
  test("should load all tasks from evals/tasks directory", async () => {
    const tasksDir = join(process.cwd(), "evals", "tasks");
    const files = await readdir(tasksDir);
    const taskFiles = files.filter(file => file.endsWith(".ts"));

    expect(taskFiles.length).toBeGreaterThan(0);
    expect(taskFiles).toContain("001-rivet-zero-shot.ts");
    expect(taskFiles).toContain("002-trapezoidal-rivet-zero-shot.ts");
  });

  test("should load rivet task correctly", async () => {
    const taskPath = join(process.cwd(), "evals", "tasks", "001-rivet-zero-shot.ts");
    const module = await import(taskPath);

    const taskExport = Object.values(module).find(
      (value): value is Task =>
        typeof value === "object" &&
        value !== null &&
        "name" in value &&
        "description" in value &&
        "type" in value &&
        "prompt" in value &&
        "createTools" in value &&
        "validate" in value
    );

    expect(taskExport).toBeDefined();
    expect(taskExport?.name).toBe("rivet");
    expect(taskExport?.type).toBe("zero-shot");
    expect(taskExport?.description).toContain("round head rivet");
  });

  test("should load trapezoidal-rivet task correctly", async () => {
    const taskPath = join(process.cwd(), "evals", "tasks", "002-trapezoidal-rivet-zero-shot.ts");
    const module = await import(taskPath);

    const taskExport = Object.values(module).find(
      (value): value is Task =>
        typeof value === "object" &&
        value !== null &&
        "name" in value &&
        "description" in value &&
        "type" in value &&
        "prompt" in value &&
        "createTools" in value &&
        "validate" in value
    );

    expect(taskExport).toBeDefined();
    expect(taskExport?.name).toBe("trapezoidal-rivet");
    expect(taskExport?.type).toBe("zero-shot");
    expect(taskExport?.description).toContain("trapezoidal head rivet");
  });

  test("task should have all required methods", async () => {
    const taskPath = join(process.cwd(), "evals", "tasks", "001-rivet-zero-shot.ts");
    const module = await import(taskPath);

    const taskExport = Object.values(module).find(
      (value): value is Task =>
        typeof value === "object" &&
        value !== null &&
        "name" in value
    ) as Task;

    expect(typeof taskExport.createTools).toBe("function");
    expect(typeof taskExport.validate).toBe("function");
    expect(typeof taskExport.prompt).toBe("string");
    expect(taskExport.prompt.length).toBeGreaterThan(0);
  });
});
