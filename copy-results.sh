#!/bin/bash
# Copy rivet.png previews from 20260113 results to saved_results

# Create destination directory
mkdir -p saved_results/20260113

# Copy files with renamed filenames based on model name
for dir in evals/results/run-20260113-*/; do
  # Extract model name from directory
  model=$(basename "$dir" | sed 's/run-20260113-[0-9]*-//')
  
  # Copy rivet.png if it exists
  if [ -f "${dir}rivet/rivet.png" ]; then
    cp "${dir}rivet/rivet.png" "saved_results/20260113/${model}-rivet.png"
    echo "Copied: ${model}-rivet.png"
  fi
done

echo "Done!"
