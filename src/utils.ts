import { mkdir } from "fs/promises";
import { dirname } from "path";

/**
 * Camera parameters for OpenSCAD rendering
 */
export interface CameraParams {
  /** Translation vector [x, y, z] */
  translation: [number, number, number];
  /** Rotation angles [x, y, z] in degrees */
  rotation: [number, number, number];
}

/**
 * Render an OpenSCAD file to an output file with optional camera parameters
 * @param openscadFile Path to the OpenSCAD source file
 * @param outputFile Path where the rendered output should be saved
 * @param camera Optional camera parameters
 * @returns Promise that resolves with success/error information
 */
export async function renderOpenSCAD(
  openscadFile: string,
  outputFile: string,
  camera?: CameraParams,
): Promise<{ success: boolean; error?: string; stdout?: string; stderr?: string }> {
  try {
    // Ensure output directory exists
    await mkdir(dirname(outputFile), { recursive: true });

    const args = [
      "-o", outputFile,
      "--render",
      "--backend=Manifold",
    ];

    // Add camera parameters if provided
    if (camera) {
      const { translation, rotation } = camera;
      const cameraString = `${translation.join(",")},${rotation.join(",")}`;
      args.push("--camera", cameraString);
    }

    args.push("--autocenter", "--viewall", openscadFile);

    const proc = Bun.spawn(["openscad", ...args], {
      stdout: "pipe",
      stderr: "pipe",
    });

    const [stdout, stderr] = await Promise.all([
      proc.stdout.text(),
      proc.stderr.text(),
    ]);

    const exitCode = await proc.exited;

    if (exitCode === 0) {
      return { success: true, stdout, stderr };
    } else {
      return {
        success: false,
        error: `OpenSCAD process exited with code ${exitCode}`,
        stdout,
        stderr,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Render an OpenSCAD file from a bottom isometric view
 * Uses camera parameters: translation=[0,0,0], rotation=[-35.264,0,45]
 * @param openscadFile Path to the OpenSCAD source file
 * @param outputFile Path where the rendered output should be saved
 * @returns Promise that resolves with success/error information
 */
export async function renderOpenSCADBottomIsometric(
  openscadFile: string,
  outputFile: string,
): Promise<{ success: boolean; error?: string; stdout?: string; stderr?: string }> {
  return renderOpenSCAD(openscadFile, outputFile, {
    translation: [0, 0, 0],
    rotation: [-35.264, 0, 45],
  });
}

/**
 * Generate a timestamp-based directory name for evaluation runs
 * @param modelName The model name used in the evaluation
 * @returns Directory name in format: run-YYYYMMDD-HHMMSS-{model-name}
 */
export function generateRunDirectoryName(modelName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Replace slashes in model name with dashes
  const sanitizedModelName = modelName.replace(/\//g, "-");

  return `run-${year}${month}${day}-${hours}${minutes}${seconds}-${sanitizedModelName}`;
}
