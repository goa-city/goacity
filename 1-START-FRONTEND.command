#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting Frontend Development Server..."
./dev-frontend.sh
# Keep window open if it fails
echo ""
echo "Press any key to close this window..."
read -n 1
