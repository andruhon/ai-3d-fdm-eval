import { tool } from "@openrouter/sdk";
import { z } from "zod";
import { readFile, writeFile } from "fs/promises";
import { resolve, isAbsolute, join } from "path";

/**
 * Create a read file tool with a specific working directory
 */
export function createReadFileTool(workdir: string) {
  return tool({
    name: "read_file",
    description:
      "Read the complete contents of a file from the file system. Returns the file content as a string. Path must be relative.",
    inputSchema: z.object({
      path: z.string().describe("Relative path to the file to read"),
    }),
    outputSchema: z.object({
      content: z.string().describe("The content of the file"),
      error: z.string().optional().describe("Error message if reading failed"),
    }),
    execute: async (params) => {
      try {
        // Reject absolute paths
        if (isAbsolute(params.path)) {
          return {
            content: "",
            error: "Absolute paths are not allowed. Please use relative paths only.",
          };
        }

        // Resolve path relative to workdir
        const absolutePath = join(workdir, params.path);
        const content = await readFile(absolutePath, "utf-8");
        return { content };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: "",
          error: `Failed to read file: ${errorMessage}`,
        };
      }
    },
  });
}

/**
 * Default read file tool (for backwards compatibility with tests)
 * Uses current working directory
 */
export const readFileTool = createReadFileTool(process.cwd());

/**
 * Create a write file tool with a specific working directory
 */
export function createWriteFileTool(workdir: string) {
  return tool({
    name: "write_file",
    description:
      "Write content to a file, creating it if it doesn't exist or overwriting if it does. Creates parent directories as needed. Path must be relative.",
    inputSchema: z.object({
      path: z.string().describe("Relative path to the file to write"),
      content: z.string().describe("Content to write to the file"),
    }),
    outputSchema: z.object({
      success: z.boolean().describe("Whether the write operation succeeded"),
      bytesWritten: z.number().optional().describe("Number of bytes written"),
      error: z.string().optional().describe("Error message if writing failed"),
    }),
    execute: async (params) => {
      try {
        // Reject absolute paths
        if (isAbsolute(params.path)) {
          return {
            success: false,
            error: "Absolute paths are not allowed. Please use relative paths only.",
          };
        }

        // Resolve path relative to workdir
        const absolutePath = join(workdir, params.path);
        await writeFile(absolutePath, params.content, "utf-8");
        const bytesWritten = Buffer.byteLength(params.content, "utf-8");
        return {
          success: true,
          bytesWritten,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        return {
          success: false,
          error: `Failed to write file: ${errorMessage}`,
        };
      }
    },
  });
}

/**
 * Default write file tool (for backwards compatibility with tests)
 * Uses current working directory
 */
export const writeFileTool = createWriteFileTool(process.cwd());

/**
 * Create filesystem tools with a specific working directory
 */
export function createFilesystemTools(workdir: string) {
  return [createReadFileTool(workdir), createWriteFileTool(workdir)] as const;
}

/**
 * Default filesystem tools (for backwards compatibility with tests)
 * Uses current working directory
 */
export const filesystemTools = [readFileTool, writeFileTool] as const;
