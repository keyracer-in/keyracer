#!/bin/bash

echo "🚀 Deploying KeyRacer Aptitude API to Production..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing process
pm2 stop keyracer-api 2>/dev/null || true
pm2 delete keyracer-api 2>/dev/null || true

# Start the server with PM2
echo "🔄 Starting server with PM2..."
pm2 start server.js --name "keyracer-api" --env production

# Save PM2 configuration
pm2 save
pm2 startup

echo "✅ Deployment complete!"
echo "🌐 Your API is now running at: https://keyracer.in/api/"
echo "📊 Monitor with: pm2 monit"
echo "📋 View logs with: pm2 logs keyracer-api"