import { describe, test, expect } from "bun:test";
import { generateRunDirectoryName, type CameraParams } from "../src/utils";
import { getTask, getTaskNames, hasTask } from "../evals/tasks";

describe("Task Registry", () => {
  test("should have rivet task", () => {
    expect(hasTask("rivet")).toBe(true);
  });

  test("should return task names", () => {
    const names = getTaskNames();
    expect(names).toContain("rivet");
    expect(names.length).toBeGreaterThan(0);
  });

  test("should get rivet task", () => {
    const task = getTask("rivet");
    expect(task).toBeDefined();
    expect(task.name).toBe("rivet");
    expect(task.type).toBe("one-shot");
    expect(task.description).toBeTruthy();
    expect(task.prompt).toBeTruthy();
    expect(task.createTools).toBeDefined();
    expect(typeof task.createTools).toBe("function");
    
    // Test that createTools returns an array
    const tools = task.createTools("/tmp/test");
    expect(Array.isArray(tools)).toBe(true);
  });

  test("should return undefined for non-existent task", () => {
    expect(hasTask("non-existent")).toBe(false);
    expect(getTask("non-existent")).toBeUndefined();
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
