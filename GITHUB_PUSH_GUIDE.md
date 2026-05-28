# GitHub Push Guide - MediGo

Bhai, saara code push karne ke 3 tareeke hain:

## Option 1: Replit Terminal Mein Direct Commands (Sabse Fast)

Replit ke **Shell** (neeche terminal) mein yeh commands ek-ek karke chalayein:

```bash
# 1. Project folder mein jaayein
cd /home/runner/workspace

# 2. Git config (first time ke liye)
git config user.name "MediGo Dev"
git config user.email "dev@medigo.app"

# 3. Lock files clean karein
rm -f .git/index.lock

# 4. Sab files stage karein
git add -A

# 5. Commit karein
git commit -m "MediGo v1.0 - Medicine delivery app with live location, analytics, delivery charge"

# 6. GitHub remote add karein
git remote add github https://github.com/prashant15042006/Madical-Shop.git

# 7. Push karein
# Note: Agar username/password maange to:
#   Username: aapka GitHub username
#   Password: GitHub Personal Access Token (normal password nahi!)
#   Token yahan banaein: https://github.com/settings/tokens
#   Token mein 'repo' permission on karein
git push github main
```

## Option 2: Script Run Karein

```bash
cd /home/runner/workspace
bash push-to-github.sh
```

## Option 3: GitHub Token Setup (Best Practice)

Agar bar-bar password nahi daalna:

```bash
# 1. GitHub token banaein:
# https://github.com/settings/tokens/new
# Name: "MediGo Push"
# Scopes: repo (full control)

# 2. Token ko credential helper mein save karein:
git config credential.helper store

# 3. Ek baar push karein (token maangega):
git push github main
# Username: prashant15042006
# Password: <ghp_xxxxxxxx token paste karein>

# 4. Ab aage se password nahi maangega!
```

---

## Kya Push Hoga

Saara MediGo project:
- ✅ Mobile app (Expo/React Native)
- ✅ API Server (Express + PostgreSQL)
- ✅ Database schema (Drizzle)
- ✅ API specs (OpenAPI)
- ✅ README.md
- ✅ GitHub Actions CI
- ✅ Play Store upload guide
- ✅ All assets, icons, screenshots

---

## Problem Aaye To

**"Permission denied" error**
- GitHub token nahi bana hai
- Token mein `repo` permission nahi hai

**"Lock file" error**
- `rm -f .git/index.lock` chalayein

**"Already up to date"**
- `git add -A` phir se chalayein

**"Remote already exists"**
- `git remote remove github` chalayein

---

Bhai, koi bhi problem aaye to mujhe bataiye!
