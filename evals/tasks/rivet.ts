import { createWriteFileTool } from "../../src/tools.js";
import type { Task, TaskResult } from "../../src/types.js";
import { renderOpenSCAD, renderOpenSCADBottomIsometric } from "../../src/utils.js";
import { existsSync } from "fs";
import { join } from "path";

/**
 * Task: Generate a round head rivet using OpenSCAD
 *
 * This task evaluates the model's ability to:
 * 1. Understand mechanical part specifications
 * 2. Generate valid OpenSCAD code
 * 3. Create a 3D model that matches given dimensions
 */
export const rivetTask: Task = {
  name: "rivet",
  description: "Generate a round head rivet with specific dimensions using OpenSCAD",
  type: "one-shot",

  prompt: `Generate an OpenSCAD file for a round head rivet with the following specifications:

Dimensions:
- Shaft diameter: 3mm
- Shaft length: 10mm
- Head diameter: 6mm
- Head height: 2mm

The rivet should be modeled as:
1. A cylindrical shaft
2. A hemispherical (dome-shaped) head on top of the shaft

Create a file called "rivet.scad" with the complete OpenSCAD code.
Use proper centering so the rivet sits on the Z=0 plane with the head pointing upward.

Important:
- Use $fn=50 or higher for smooth curves
- Make sure all measurements are in millimeters
- The shaft and head should be a single unified object (use union if needed)`,

  createTools: (workdir: string) => [createWriteFileTool(workdir)],

  async validate(outputDir: string): Promise<TaskResult> {
    const scadFile = join(outputDir, "rivet.scad");
    const pngFile = join(outputDir, "rivet.png");
    const pngBottomFile = join(outputDir, "rivet-bottom.png");

    // Check if the OpenSCAD file was created
    if (!existsSync(scadFile)) {
      return {
        taskName: "rivet",
        success: false,
        error: "rivet.scad file was not created",
        outputPath: outputDir,
      };
    }

    // Render default view
    console.log(`Rendering default view: ${scadFile} -> ${pngFile}`);
    const renderResult = await renderOpenSCAD(scadFile, pngFile);

    if (!renderResult.success) {
      return {
        taskName: "rivet",
        success: false,
        error: `Failed to render OpenSCAD file (default view): ${renderResult.error}`,
        outputPath: outputDir,
        metadata: {
          stdout: renderResult.stdout,
          stderr: renderResult.stderr,
        },
      };
    }

    // Check if default png file was created
    if (!existsSync(pngFile)) {
      return {
        taskName: "rivet",
        success: false,
        error: "PNG file was not generated despite successful render (default view)",
        outputPath: outputDir,
        metadata: {
          stdout: renderResult.stdout,
          stderr: renderResult.stderr,
        },
      };
    }

    // Render bottom isometric view
    console.log(`Rendering bottom isometric view: ${scadFile} -> ${pngBottomFile}`);
    const renderBottomResult = await renderOpenSCADBottomIsometric(scadFile, pngBottomFile);

    if (!renderBottomResult.success) {
      return {
        taskName: "rivet",
        success: false,
        error: `Failed to render OpenSCAD file (bottom isometric view): ${renderBottomResult.error}`,
        outputPath: outputDir,
        metadata: {
          defaultView: {
            success: true,
            file: pngFile,
          },
          bottomView: {
            success: false,
            stdout: renderBottomResult.stdout,
            stderr: renderBottomResult.stderr,
          },
        },
      };
    }

    // Check if bottom png file was created
    if (!existsSync(pngBottomFile)) {
      return {
        taskName: "rivet",
        success: false,
        error: "PNG file was not generated despite successful render (bottom isometric view)",
        outputPath: outputDir,
        metadata: {
          defaultView: {
            success: true,
            file: pngFile,
          },
          bottomView: {
            success: false,
            stdout: renderBottomResult.stdout,
            stderr: renderBottomResult.stderr,
          },
        },
      };
    }

    return {
      taskName: "rivet",
      success: true,
      outputPath: outputDir,
      metadata: {
        scadFile,
        pngFile,
        pngBottomFile,
        defaultView: {
          success: true,
          stdout: renderResult.stdout,
          stderr: renderResult.stderr,
        },
        bottomView: {
          success: true,
          stdout: renderBottomResult.stdout,
          stderr: renderBottomResult.stderr,
        },
      },
    };
  },
};
