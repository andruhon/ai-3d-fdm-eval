# Model Mesh Evaluations

This document describes how to run evaluations across multiple models using the mesh evaluation system.

## Quick Start

Run all models against all tasks:
```bash
bun run mesh
# or directly:
bun run index.ts --mesh
```

Run all models against a specific task:
```bash
bun run mesh rivet
# or directly:
bun run index.ts --mesh rivet
```

Run with verbose error output:
```bash
bun run mesh --verbose
bun run mesh rivet --verbose
```

## All Usage Modes

The entry point `index.ts` supports both single-model and mesh evaluation modes:

### Single Model Evaluation
```bash
# Run one model against all tasks
bun run index.ts anthropic/claude-4.5-sonnet

# Run one model against a specific task
bun run index.ts anthropic/claude-4.5-sonnet rivet

# Or use the npm script
bun run eval anthropic/claude-4.5-sonnet
```

### Mesh Evaluation
```bash
# Run all models against all tasks
bun run index.ts --mesh

# Run all models against a specific task
bun run index.ts --mesh rivet

# Run with verbose output
bun run index.ts --mesh rivet --verbose

# Or use the npm script
bun run mesh
bun run mesh rivet
bun run mesh rivet --verbose
```

## Configuration

Models are defined in `models-config.json`. This file contains:

```json
{
  "models": [
    "google/gemini-3-flash-preview",
    "z-ai/glm-4.6v",
    "openai/gpt-5.2",
    "x-ai/grok-4.1-fast",
    "anthropic/claude-sonnet-4.5",
    "qwen/qwen3-vl-235b-a22b-instruct"
  ],
  "metadata": {
    "description": "Multimodal models with image support",
    "lastUpdated": "2026-01-12"
  }
}
```

### Adding/Removing Models

Edit `models-config.json` to add or remove models from the evaluation mesh:

```json
{
  "models": [
    "your/model-name",
    "another/model-name"
  ]
}
```

## Output

The mesh evaluation provides:

1. **Per-model progress**: Shows each model being evaluated with success/failure indicators
2. **Summary report**: Final statistics showing total evaluations, successes, and failures
3. **Error details**: Lists all failed evaluations with model and task information

### Example Output

```
==================================================
🔬 MODEL MESH EVALUATION
==================================================

Models to evaluate: 6
Description: Multimodal models with image support for 3D evaluation tasks

  - google/gemini-3-flash-preview
  - z-ai/glm-4.6v
  - openai/gpt-5.2
  - x-ai/grok-4.1-fast
  - anthropic/claude-sonnet-4.5
  - qwen/qwen3-vl-235b-a22b-instruct

Running all available tasks for each model

==================================================
🚀 Running: google/gemini-3-flash-preview
   Task: all tasks
==================================================
✅ Success: google/gemini-3-flash-preview (all tasks)

...

==================================================
📊 MESH EVALUATION SUMMARY
==================================================
Total evaluations: 6
Successful:        5
Failed:            1

Failed evaluations:
  ❌ openai/gpt-5.2 (all tasks)

```

## Exit Codes

- `0`: All evaluations successful
- `1`: One or more evaluations failed or fatal error occurred

## Integration with CI/CD

The mesh evaluation can be used in CI pipelines:

```yaml
# .github/workflows/eval.yml
- name: Run model mesh evaluations
  run: bun run mesh rivet
```

## Old Shell Script

The original `run-evals.sh` bash script has been superseded by the new Bun-based mesh system, which provides:

- ✅ Better error handling and reporting
- ✅ Centralized configuration in `models-config.json`
- ✅ TypeScript integration via `index.ts` entry point
- ✅ Unified interface for single and mesh evaluations
- ✅ Easier to extend and maintain
- ✅ Consistent with the rest of the codebase

The shell script can be removed or kept for reference.
