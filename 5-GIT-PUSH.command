#!/bin/bash
cd "$(dirname "$0")"

echo "📂 Adding all changes to Git..."
git add .

echo "📝 Enter your commit message (or press Enter to use 'Update'):"
read msg
if [ -z "$msg" ]; then
    msg="Update at $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo "💾 Committing changes..."
git commit -m "$msg"

echo "🚀 Pushing to Git..."
git push

echo ""
echo "✅ GIT PUSH COMPLETE!"
echo "Press any key to close this window..."
read -n 1
