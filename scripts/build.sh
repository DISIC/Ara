#!/bin/bash
set -e

echo "🚧 BUILDING... Installing Playwright Chromium headless shell..."
yarn workspace confiture-rest-api exec playwright-core install chromium --only-shell

echo "📦 Contents of Playwright cache:"
find ~/.cache/ms-playwright -maxdepth 1 -mindepth 1 -type d -exec du -sh {} \;

echo "📦 Playwright cache after installation:"
du -sh ~/.cache/ms-playwright || true

echo "🚧 BUILDING... Generating API types..."
yarn copytypes

echo "🚧 BUILDING... Generating RGAA files..."
yarn workspace confiture-web-app run generate:rgaa

echo "🚧 BUILDING... Building client app..."
yarn workspace confiture-web-app run build

echo "🚧 BUILDING... Building backend app..."
yarn workspace confiture-rest-api run build

echo "🚧 BUILDING... Moving frontend build to backend static folder"
rm -rf confiture-rest-api/client
mv confiture-web-app/dist confiture-rest-api/client

echo "📦 node_modules before pruning:"
du -sh node_modules || true

echo "📦 Playwright cache before pruning:"
du -sh ~/.cache/ms-playwright || true

echo "🚧 BUILDING... Pruning dependencies"
yarn workspaces focus confiture-rest-api --production

echo "📦 node_modules after pruning:"
du -sh node_modules || true

echo "📦 Playwright cache after pruning:"
du -sh ~/.cache/ms-playwright || true

echo "🧹 Cleaning Cypress cache..."
rm -rf ~/.cache/Cypress

echo "📦 Global cache after cleanup:"
du -sh ~/.cache || true

yarn cache clean

echo "✅ BUILDING DONE !"
