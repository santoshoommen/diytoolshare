#!/bin/bash

# Render.com build script for marketplace app
set -e

echo "🔧 Starting Render.com build process..."

# Ensure we're in the right directory
cd /opt/render/project/src/apps/marketplace

echo "📦 Installing dependencies..."
yarn install --frozen-lockfile --production=false

echo "🔨 Building the application..."
yarn build

echo "✅ Build completed successfully!"
