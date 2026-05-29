#!/bin/bash
set -e

echo "=== Vercel Build Script for MediGo ==="
echo "Install pnpm globally if not available..."
npm install -g pnpm

echo "Installing dependencies with pnpm..."
pnpm install --frozen-lockfile

echo "Building frontend..."
pnpm --filter @workspace/frontend run build

echo "Build completed successfully!"
