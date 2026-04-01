#!/bin/bash
echo "🛑 Stopping all development servers..."

# Kill processes on known ports
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null

echo "✅ Done."
