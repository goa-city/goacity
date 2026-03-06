#!/bin/bash
cd "$(dirname "$0")"
SSH_KEY="ssh-key-2026-02-20.key"
REMOTE="ubuntu@140.238.245.13"

echo "🚢 STARTING FULL DEPLOYMENT..."
echo ""

# 1. Backend
echo "📦 Building Backend..."
cd backend_node && npm run build
if [ $? -eq 0 ]; then
    echo "✅ Backend Build Successful"
    echo "📤 Uploading Backend to Server..."
    rsync -avz --quiet -e "ssh -i ../$SSH_KEY" dist/ $REMOTE:/var/www/goa.city/backend_node/dist/
    rsync -avz --quiet -e "ssh -i ../$SSH_KEY" .env $REMOTE:/var/www/goa.city/backend_node/.env
    rsync -avz --quiet -e "ssh -i ../$SSH_KEY" prisma/ $REMOTE:/var/www/goa.city/backend_node/prisma/
    
    echo "🔄 Generating Prisma Client on Server..."
    ssh -i ../$SSH_KEY $REMOTE "cd /var/www/goa.city/backend_node && npx prisma db push && npx prisma generate"

    echo "🔄 Restarting Backend Service..."
    ssh -i ../$SSH_KEY $REMOTE "pm2 restart goa-city-backend"
    echo "✅ Backend Deployed"
else
    echo "❌ Backend Build Failed! Aborting."
    exit 1
fi

cd ..
echo ""

# 2. Frontend
echo "📦 Building Frontend..."
cd frontend && npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend Build Successful"
    echo "📤 Uploading Frontend to Server..."
    rsync -avz --quiet -e "ssh -i ../$SSH_KEY" dist/ $REMOTE:/home/ubuntu/frontend_dist/
    echo "✅ Frontend Deployed"
else
    echo "❌ Frontend Build Failed!"
    exit 1
fi

echo ""
echo "✨ DEPLOYMENT COMPLETE!"
echo "Press any key to close this window..."
read -n 1
