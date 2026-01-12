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

### Example 1: Run all tasks with Claude

```bash
bun run eval anthropic/claude-3.5-sonnet
```

Output:
```
🚀 Starting evaluation
   Model: anthropic/claude-3.5-sonnet
   Tasks: rivet
   Output: evals/results/run-20260112-180000-anthropic-claude-3.5-sonnet

📋 Running task: rivet
   Description: Generate a round head rivet with specific dimensions using OpenSCAD
   Type: one-shot
   Model: anthropic/claude-3.5-sonnet

🤖 Calling model...

📝 Model response:
[Model's response will appear here]

✅ Validating task output...
Rendering evals/results/run-20260112-180000-anthropic-claude-3.5-sonnet/rivet/rivet.scad...
✅ Task completed successfully!

============================================================
📊 EVALUATION SUMMARY
============================================================
Model: anthropic/claude-3.5-sonnet
Run directory: evals/results/run-20260112-180000-anthropic-claude-3.5-sonnet

Results:
  ✅ PASS rivet

Total: 1 tasks
Passed: 1
Failed: 0
Success rate: 100.0%
============================================================
```

### Example 2: Run a specific task

```bash
bun run eval openai/gpt-4o rivet
```

### Example 3: Compare multiple models

```bash
# Test Claude
bun run eval anthropic/claude-3.5-sonnet

# Test GPT-4
bun run eval openai/gpt-4o

# Test a cheaper model
bun run eval meta-llama/llama-3.1-8b-instruct
```

## Viewing Results

Results are saved in `evals/results/` with timestamped directories:

```
evals/results/
└── run-20260112-180000-anthropic-claude-3.5-sonnet/
    └── rivet/
        ├── rivet.scad  # Generated OpenSCAD code
        └── rivet.stl   # Rendered 3D model (if successful)
```

You can:
- Open `.scad` files in OpenSCAD to view the code
- Open `.stl` files in any 3D viewer to see the rendered model
- Compare outputs across different model runs

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
- Look at [evals/tasks/rivet.ts](evals/tasks/rivet.ts) to see an example task implementation
