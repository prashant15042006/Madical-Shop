#!/bin/bash
# MediGo GitHub Push Script
# Bhai, is script ko Replit terminal mein run karein: bash push-to-github.sh

set -e

echo "=== MediGo GitHub Push ==="
echo "Repo: https://github.com/prashant15042006/Madical-Shop.git"
echo ""

# 1. Git config set karein (agar nahi hai)
echo "Step 1: Git config check..."
git config user.name "MediGo Dev" 2>/dev/null || true
git config user.email "dev@medigo.app" 2>/dev/null || true

# 2. Lock file hataein (agar stuck hai)
echo "Step 2: Cleaning lock files..."
rm -f .git/index.lock 2>/dev/null || true
rm -f .git/refs/heads/*.lock 2>/dev/null || true

# 3. Check current status
echo "Step 3: Git status..."
git status --short

# 4. Sabhi files stage karein
echo "Step 4: Staging all files..."
git add -A

# 5. Commit karein
echo "Step 5: Committing..."
git commit -m "MediGo v1.0 - Medicine Delivery App

Features:
- Live location tracking for customers
- Price breakdown (Items + Delivery Charge)
- Daily delivery report for shopkeepers
- 7-day analytics dashboard
- UPI/COD payment options
- Real-time order notifications
- Hindi/Hinglish interface" || echo "Nothing to commit (already committed)"

# 6. GitHub remote add karein
echo "Step 6: Adding GitHub remote..."
git remote remove github 2>/dev/null || true
git remote add github https://github.com/prashant15042006/Madical-Shop.git

# 7. Push karein
echo "Step 7: Pushing to GitHub..."
echo "Agar username/password maange to:"
echo "  - Username: GitHub username"
echo "  - Password: GitHub Personal Access Token (NOT password)"
echo "  - Token banaein: https://github.com/settings/tokens"
echo ""
git push github main --force

echo ""
echo "=== Done! ==="
echo "Check: https://github.com/prashant15042006/Madical-Shop"
