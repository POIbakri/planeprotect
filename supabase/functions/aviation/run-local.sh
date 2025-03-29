#!/bin/bash

# Run Deno directly with absolute path and a specific port
$HOME/.deno/bin/deno run --allow-net --allow-env --allow-read --watch --env index.ts --port=8001 