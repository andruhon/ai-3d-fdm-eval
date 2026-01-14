import { createWriteFileTool } from "../../src/tools.js";
import type { Task, TaskResult } from "../../src/types.js";
import { renderOpenSCAD, renderOpenSCADBottomIsometric } from "../../src/utils.js";
import { existsSync } from "fs";
import { join } from "path";

/**
 * Task: Generate a trapezoidal head rivet plug using OpenSCAD
 *
 * This task evaluates the model's ability to:
 * 1. Understand mechanical part specifications for a plug-style rivet
 * 2. Generate valid OpenSCAD code with chamfered features
 * 3. Create a 3D-printable model considering print orientation and support-free constraints
 * 4. Apply proper chamfer angles for 3D printing without supports
 */
export const trapezoidalRivetTask: Task = {
  name: "trapezoidal-rivet",
  description: "Generate a trapezoidal head rivet plug designed for 3D printing on its head",
  type: "zero-shot",

  prompt: `Generate an OpenSCAD file for a trapezoidal head rivet plug with the following specifications:

Dimensions:
- Total height: 18mm
- Shaft diameter: 4mm
- Shaft length: 12mm
- Head bottom diameter: 8mm
- Head top diameter: 6mm
- Head height: 6mm

Design requirements:
1. The rivet head should have a trapezoidal profile (frustum/truncated cone shape), expanding towards the shaft.
2. The chamfer angle on the head should be 35 degrees or less (measured from vertical) to enable 3D printing without supports
3. The part will be printed standing on its head (inverted), so the head should be at the bottom in the model
4. Model the rivet with the head at Z=0 (bottom) and shaft pointing upward
5. The shaft and head should be a single unified object

Create a file called "trapezoidal-rivet.scad" with the complete OpenSCAD code.

Important:
- Use $fn=50 or higher for smooth curves
- Make sure all measurements are in millimeters
- Verify the chamfer angle is within the 35-degree constraint for support-free printing
- Position the model with the head at the bottom (will be printed this way)`,

  createTools: (workdir: string) => [createWriteFileTool(workdir)],

  async validate(outputDir: string): Promise<TaskResult> {
    const scadFile = join(outputDir, "trapezoidal-rivet.scad");
    const pngFile = join(outputDir, "trapezoidal-rivet.png");
    const pngBottomFile = join(outputDir, "trapezoidal-rivet-bottom.png");

    // Check if the OpenSCAD file was created
    if (!existsSync(scadFile)) {
      return {
        taskName: "trapezoidal-rivet",
        success: false,
        error: "trapezoidal-rivet.scad file was not created",
        outputPath: outputDir,
      };
    }

    // Render default view
    console.log(`Rendering default view: ${scadFile} -> ${pngFile}`);
    const renderResult = await renderOpenSCAD(scadFile, pngFile);

    if (!renderResult.success) {
      return {
        taskName: "trapezoidal-rivet",
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
        taskName: "trapezoidal-rivet",
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
        taskName: "trapezoidal-rivet",
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
        taskName: "trapezoidal-rivet",
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
      taskName: "trapezoidal-rivet",
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
