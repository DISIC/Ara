#!/bin/bash
set -e

echo "🚧 BUILDING... Installing Playwright Chromium headless shell..."
yarn workspace confiture-rest-api playwright install --only-shell

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

yarn cache clean

echo "✅ BUILDING DONE !"
