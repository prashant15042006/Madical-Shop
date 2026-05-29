# MediGo Deployment Guide

## Backend - Render Pe Deploy Karna

### Step 1: Render Account Create Karein
1. [render.com](https://render.com) pe jayein
2. Sign up karein (GitHub se bhi kar sakte hain)

### Step 2: Blueprint Deploy Karein
1. Render Dashboard → **Blueprints** → **New Blueprint**
2. Apna GitHub repo connect karein: `prashant15042006/Madical-Shop`
3. `render.yaml` automatically detect ho jayega
4. **Deploy** button click karein

### Step 3: Environment Variables
Render automatically set karega:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Auto-generated secret
- `PORT` - 8080

### Step 4: API URL Update Karein
`artifacts/mobile/lib/api-client.ts` mein:
```javascript
const PROD_API_URL = "https://medigo-api.onrender.com";
```

Ya `EXPO_PUBLIC_API_BASE_URL` environment variable set karein.

---

## Frontend - Vercel Pe Deploy Karna

### Step 1: Vercel Account Create Karein
1. [vercel.com](https://vercel.com) pe jayein
2. Sign up karein (GitHub se bhi kar sakte hain)

### Step 2: Project Import Karein
1. **Add New Project** → GitHub repo select karein
2. **Framework Preset**: Other
3. **Build Command**: `pnpm install && pnpm --filter @workspace/frontend run build`
4. **Output Directory**: `frontend/static-build`
5. **Environment Variables**:
   - `EXPO_PUBLIC_API_BASE_URL`: `https://medigo-api.onrender.com`

### Step 3: Deploy
**Deploy** button click karein

---

## Done! 🎉

Backend: `https://medigo-api.onrender.com`
Frontend: `https://medigo-app.vercel.app`
