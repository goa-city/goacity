#!/bin/bash
cd "$(dirname "$0")"
./stop-dev.sh
echo ""
echo "Done. Press any key to close this window..."
read -n 1
