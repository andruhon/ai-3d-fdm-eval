import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { readFileTool, writeFileTool, createReadFileTool, createWriteFileTool } from "../src/tools.js";
import { unlink, mkdir, rmdir } from "fs/promises";
import { resolve } from "path";

describe("Filesystem Tools", () => {
  const testDir = "./test-temp";
  const testFilePath = "./test-temp/test-file.txt";

  beforeEach(async () => {
    // Create test directory
    try {
      await mkdir(resolve(testDir), { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await unlink(resolve(testFilePath));
    } catch (error) {
      // File might not exist
    }
    try {
      await rmdir(resolve(testDir));
    } catch (error) {
      // Directory might not be empty or not exist
    }
  });

  describe("writeFileTool", () => {
    test("should write content to a new file", async () => {
      if (!writeFileTool.function.execute) {
        throw new Error("writeFileTool.function.execute is not defined");
      }

      const content = "Hello, World!";
      const result = await writeFileTool.function.execute({
        path: testFilePath,
        content,
      });

      expect(result.success).toBe(true);
      expect(result.bytesWritten).toBe(Buffer.byteLength(content, "utf-8"));
      expect(result.error).toBeUndefined();
    });

    test("should overwrite existing file", async () => {
      if (!writeFileTool.function.execute) {
        throw new Error("writeFileTool.function.execute is not defined");
      }

      // Write initial content
      await writeFileTool.function.execute({
        path: testFilePath,
        content: "Initial content",
      });

      // Overwrite with new content
      const newContent = "New content";
      const result = await writeFileTool.function.execute({
        path: testFilePath,
        content: newContent,
      });

      expect(result.success).toBe(true);
      expect(result.bytesWritten).toBe(Buffer.byteLength(newContent, "utf-8"));
    });

    test("should handle write errors gracefully", async () => {
      if (!writeFileTool.function.execute) {
        throw new Error("writeFileTool.function.execute is not defined");
      }

      // Try to write to an invalid relative path (invalid directory structure)
      const result = await writeFileTool.function.execute({
        path: "invalid/deeply/nested/path/that/does/not/exist/file.txt",
        content: "test",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Failed to write file");
    });
  });

  describe("readFileTool", () => {
    test("should read content from an existing file", async () => {
      if (
        !writeFileTool.function.execute ||
        !readFileTool.function.execute
      ) {
        throw new Error("Tool execute functions are not defined");
      }

      // First write a file
      const content = "Test content for reading";
      await writeFileTool.function.execute({
        path: testFilePath,
        content,
      });

      // Then read it
      const result = await readFileTool.function.execute({
        path: testFilePath,
      });

      expect(result.content).toBe(content);
      expect(result.error).toBeUndefined();
    });

    test("should handle read errors for non-existent files", async () => {
      if (!readFileTool.function.execute) {
        throw new Error("readFileTool.function.execute is not defined");
      }

      const result = await readFileTool.function.execute({
        path: "./test-temp/non-existent-file.txt",
      });

      expect(result.content).toBe("");
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Failed to read file");
    });

    test("should read empty file correctly", async () => {
      if (
        !writeFileTool.function.execute ||
        !readFileTool.function.execute
      ) {
        throw new Error("Tool execute functions are not defined");
      }

      // Write empty file
      await writeFileTool.function.execute({
        path: testFilePath,
        content: "",
      });

      // Read it
      const result = await readFileTool.function.execute({
        path: testFilePath,
      });

      expect(result.content).toBe("");
      expect(result.error).toBeUndefined();
    });
  });

  describe("Integration: read and write", () => {
    test("should write and then read the same content", async () => {
      if (
        !writeFileTool.function.execute ||
        !readFileTool.function.execute
      ) {
        throw new Error("Tool execute functions are not defined");
      }

      const content = "Integration test content\nWith multiple lines\n";

      // Write
      const writeResult = await writeFileTool.function.execute({
        path: testFilePath,
        content,
      });
      expect(writeResult.success).toBe(true);

      // Read
      const readResult = await readFileTool.function.execute({
        path: testFilePath,
      });
      expect(readResult.content).toBe(content);
      expect(readResult.error).toBeUndefined();
    });
  });
});

describe("Filesystem Tools with Workdir", () => {
  const workdir = resolve("./test-workdir");
  const relativeFilePath = "test-file.txt";
  const absoluteFilePath = resolve(workdir, relativeFilePath);

  beforeEach(async () => {
    // Create test directory
    try {
      await mkdir(workdir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await unlink(absoluteFilePath);
    } catch (error) {
      // File might not exist
    }
    try {
      await rmdir(workdir);
    } catch (error) {
      // Directory might not be empty or not exist
    }
  });

  describe("createWriteFileTool with workdir", () => {
    test("should write to relative path within workdir", async () => {
      const tool = createWriteFileTool(workdir);
      if (!tool.function.execute) {
        throw new Error("writeFileTool.function.execute is not defined");
      }

      const content = "Hello from workdir!";
      const result = await tool.function.execute({
        path: relativeFilePath,
        content,
      });

      expect(result.success).toBe(true);
      expect(result.bytesWritten).toBe(Buffer.byteLength(content, "utf-8"));
    });

    test("should reject absolute paths", async () => {
      const tool = createWriteFileTool(workdir);
      if (!tool.function.execute) {
        throw new Error("writeFileTool.function.execute is not defined");
      }

      const result = await tool.function.execute({
        path: "/absolute/path/test.txt",
        content: "test",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Absolute paths are not allowed");
    });
  });

  describe("createReadFileTool with workdir", () => {
    test("should read from relative path within workdir", async () => {
      const writeTool = createWriteFileTool(workdir);
      const readTool = createReadFileTool(workdir);
      
      if (!writeTool.function.execute || !readTool.function.execute) {
        throw new Error("Tool execute functions are not defined");
      }

      // Write file first
      const content = "Content in workdir";
      await writeTool.function.execute({
        path: relativeFilePath,
        content,
      });

      // Read it back
      const result = await readTool.function.execute({
        path: relativeFilePath,
      });

      expect(result.content).toBe(content);
      expect(result.error).toBeUndefined();
    });

    test("should reject absolute paths", async () => {
      const tool = createReadFileTool(workdir);
      if (!tool.function.execute) {
        throw new Error("readFileTool.function.execute is not defined");
      }

      const result = await tool.function.execute({
        path: "/absolute/path/test.txt",
      });

      expect(result.content).toBe("");
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Absolute paths are not allowed");
    });
  });
});
