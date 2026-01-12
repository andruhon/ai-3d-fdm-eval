# Evaluation Tasks

This directory contains evaluation tasks for testing 3D modeling capabilities of language models.

## Directory Structure

```
evals/
├── tasks/          # Task definitions
│   ├── index.ts    # Task registry
│   └── rivet.ts    # Example: Round head rivet task
└── results/        # Evaluation run outputs
    └── run-YYYYMMDD-HHMMSS-{model-name}/
        └── {task-name}/
            ├── *.scad           # Generated OpenSCAD files
            ├── *-bottom.png     # Bottom isometric view
            └── *.png            # Default view rendering
```

## Running Evaluations

### Run all tasks for a model:
```bash
bun run index.ts anthropic/claude-3.5-sonnet
```

### Run a specific task:
```bash
bun run index.ts anthropic/claude-3.5-sonnet rivet
```

## Available Tasks

### `rivet`
- **Type:** One-shot
- **Description:** Generate a round head rivet with specific dimensions
- **Tools:** write_file
- **Validation:** 
  - Verifies OpenSCAD file was created
  - Renders two PNG views using `openscad` CLI:
    - Default view (autocenter/viewall)
    - Bottom isometric view (camera: 0,0,0,-35.264,0,45)
  - Checks that both PNG files were generated successfully

## Creating New Tasks

To create a new task:

1. Create a new file in `evals/tasks/` (e.g., `my-task.ts`)
2. Define a task object implementing the `Task` interface:

```typescript
import type { Task, TaskResult } from "../../src/types.js";
import { createWriteFileTool } from "../../src/tools.js";

export const myTask: Task = {
  name: "my-task",
  description: "What this task evaluates",
  type: "one-shot", // or "multi-turn"
  
  prompt: `Your prompt for the model...`,
  
  // Factory function creates tools scoped to the output directory
  createTools: (workdir: string) => [createWriteFileTool(workdir)],
  
  async validate(outputDir: string): Promise<TaskResult> {
    // Validate the task output
    // Return { taskName, success, error?, outputPath, metadata? }
  },
};
```

3. Register the task in `evals/tasks/index.ts`:

```typescript
import { myTask } from "./my-task.js";

export const tasks: TaskRegistry = {
  rivet: rivetTask,
  "my-task": myTask,  // Add your task here
};
```

## Rendering Utilities

The evaluation framework provides rendering utilities in `src/utils.ts`:

### `renderOpenSCAD(scadFile, outputFile, camera?)`
Renders an OpenSCAD file to PNG with optional camera parameters.

```typescript
import { renderOpenSCAD } from "../../src/utils.js";

// Default view
await renderOpenSCAD("model.scad", "output.png");

// Custom camera angle
await renderOpenSCAD("model.scad", "output.png", {
  translation: [0, 0, 0],
  rotation: [45, 0, 30],
});
```

### `renderOpenSCADBottomIsometric(scadFile, outputFile)`
Convenience function for bottom isometric view (rotation: -35.264°, 0°, 45°).

```typescript
import { renderOpenSCADBottomIsometric } from "../../src/utils.js";

await renderOpenSCADBottomIsometric("model.scad", "output-bottom.png");
```

Both functions return:
```typescript
{
  success: boolean;
  error?: string;
  stdout?: string;
  stderr?: string;
}
```

## File System Tools

Tasks have access to sandboxed file system tools:

- **`createWriteFileTool(workdir)`** - Write files (LLM can only use relative paths)
- **`createReadFileTool(workdir)`** - Read files (LLM can only use relative paths)

Files are automatically scoped to the task's output directory for security.

## Requirements

- OpenSCAD must be installed and available in PATH for rendering validation
- OPENROUTER_API_KEY environment variable must be set

## Future Enhancements

Planned features:
- Allow LLMs to request custom camera angles via a tool
- Multiple rendering views per task
- Camera angle presets (top, front, side, various isometric angles)
