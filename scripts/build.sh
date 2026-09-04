#!/bin/bash
set -e

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

echo "🚧 BUILDING... Pruning dependencies"
yarn workspaces focus --production --all

echo "✅ BUILDING DONE !"
