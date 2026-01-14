# Quick Start Guide

## Setup

1. **Install Bun** (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Install OpenSCAD** (for rendering validation):
   - **macOS**: `brew install openscad`
   - **Ubuntu/Debian**: `sudo apt-get install openscad`
   - **Windows**: Download from [openscad.org](https://openscad.org/downloads.html)

3. **Install dependencies**:
   ```bash
   bun install
   ```

4. **Set your OpenRouter API key**:
   ```bash
   export OPENROUTER_API_KEY=sk-or-v1-...
   ```

## Running Your First Evaluation

### Example 1: Run all tasks with Claude Sonnet

```bash
bun run eval anthropic/claude-sonnet-4.5
```

Output:
```
🚀 Starting evaluation
   Model: anthropic/claude-sonnet-4.5
   Tasks: rivet, trapezoidal-rivet
   Output: evals/results/run-20260114-180000-anthropic-claude-sonnet-4.5

📋 Running task: rivet
   Description: Generate a round head rivet with specific dimensions using OpenSCAD
   Type: zero-shot
   Model: anthropic/claude-sonnet-4.5

🤖 Calling model...

📝 Model response:
[Model's response will appear here]

✅ Validating task output...
Rendering default view: rivet.scad -> rivet.png
Rendering bottom isometric view: rivet.scad -> rivet-bottom.png
✅ Task completed successfully!

============================================================
📊 EVALUATION SUMMARY
============================================================
Model: anthropic/claude-sonnet-4.5
Run directory: evals/results/run-20260114-180000-anthropic-claude-sonnet-4.5

Results:
  ✅ PASS rivet
  ✅ PASS trapezoidal-rivet

Total: 2 tasks
Passed: 2
Failed: 0
Success rate: 100.0%
============================================================
```

### Example 2: Run a specific task

```bash
bun run eval openai/gpt-5.2 rivet
```

### Example 3: Run evaluation mesh across all models

The `models-config.json` file contains a curated list of models to test:

```bash
# Run all configured models on all tasks
bun run mesh

# Run all configured models on a specific task
bun run mesh rivet
```

Configured models (from `models-config.json`):
- `google/gemini-3-flash-preview` - Google's Gemini 3 Flash
- `openai/gpt-5.2` - OpenAI's GPT-5.2
- `anthropic/claude-sonnet-4.5` - Anthropic's Claude Sonnet 4.5
- `anthropic/claude-opus-4.5` - Anthropic's Claude Opus 4.5
- `x-ai/grok-4.1-fast` - xAI's Grok 4.1 Fast
- `qwen/qwen3-vl-235b-a22b-instruct` - Qwen's 3-VL
- `z-ai/glm-4.6v` - GLM-4.6V

### Example 4: Compare individual models

```bash
# Test Claude Opus (most capable)
bun run eval anthropic/claude-opus-4.5

# Test GPT-5.2
bun run eval openai/gpt-5.2

# Test Gemini 3 Flash (faster/cheaper)
bun run eval google/gemini-3-flash-preview
```

## Viewing Results

Results are saved in `evals/results/` with timestamped directories:

```
evals/results/
└── run-20260114-180000-anthropic-claude-sonnet-4.5/
    ├── rivet/
    │   ├── rivet.scad         # Generated OpenSCAD code
    │   ├── rivet.png          # Default view render
    │   └── rivet-bottom.png   # Bottom isometric view render
    └── trapezoidal-rivet/
        ├── trapezoidal-rivet.scad
        ├── trapezoidal-rivet.png
        └── trapezoidal-rivet-bottom.png
```

You can:
- Open `.scad` files in OpenSCAD to view and edit the code
- View `.png` files to see rendered perspectives of the 3D model
- Compare outputs across different model runs to see quality differences
- Inspect the code quality and adherence to specifications

## Troubleshooting

### "OPENROUTER_API_KEY environment variable is not set"

Make sure you've exported your API key:
```bash
export OPENROUTER_API_KEY=your-key-here
```

### "openscad: command not found"

Install OpenSCAD using your system's package manager (see Setup section above).

### Task validation fails

Check the task output directory for the generated `.scad` file and any error messages in the console output. The model may have:
- Generated invalid OpenSCAD syntax
- Created the wrong filename
- Not used the write_file tool correctly

## Next Steps

- Read [evals/README.md](evals/README.md) to learn how to create new tasks
- Check [README.md](README.md) for full documentation
- Look at existing tasks in `evals/tasks/` for implementation examples:
  - `001-rivet-zero-shot.ts` - Simple round head rivet
  - `002-trapezoidal-rivet-zero-shot.ts` - Trapezoidal rivet for 3D printing
- Edit `models-config.json` to customize which models to test in mesh evaluations
