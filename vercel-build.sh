#!/bin/bash
set -e

echo "=== Vercel Build Script for MediGo ==="
echo "Install pnpm globally if not available..."
npm install -g pnpm@9

echo "Installing dependencies with pnpm (include devDependencies)..."
pnpm install --frozen-lockfile --prod=false

echo "Building frontend..."
pnpm --filter @workspace/frontend run build

echo "Build completed successfully!"
