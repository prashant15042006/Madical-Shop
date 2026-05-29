# 🏥 MediGo - Medicine Delivery App

> **Aapki dawai, aapke darwaze tak** — Aapke sheher ki medicine delivery app.

[![Expo](https://img.shields.io/badge/Expo-54.0.0-blue)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)](https://reactnative.dev)
[![Express](https://img.shields.io/badge/Express-5.0-green)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://postgresql.org)

<p align="center">
  <img src="frontend/assets/images/icon.png" width="120" height="120" alt="MediGo App Icon">
</p>

## 🌟 Features

### Customer Ke Liye
- 💊 **Medicine khareediye** ghar baithe
- 📍 **Live location** se fast delivery — dukandar ko sahi jagah dikhti hai
- 💰 **Cash on Delivery** ya **UPI** payment
- 📉 **Price breakdown** — Items + Delivery Charge (₹10) + Total
- 📥 **My Orders** — sabhi order ka history
- ⭐ **Order rating** de sakte hain

### Dukandar (Shopkeeper) Ke Liye
- 📋 **Naye orders** real-time mein
- 🗓️ **60-minute delivery** window
- 📈 **Daily delivery report** — kon si dawai kitni biki, net kamai
- 🗺️ **7-din ka day-wise report** — orders/delivered/kamai per day
- 📍 **Live location map** pe dekhein — Google Maps/Apple Maps
- 📥 **Order status** update karein (delivered)
- 🚨 **Low stock alerts** — medicines jinka stock kam hai

### App Quality
- ⚖️ **Single app** for both customer and dukandar
- 🇮🇳 **Hindi/Hinglish** interface
- 🚀 **Fast loading** — 8s shop / 12s customer polling
- 💎 **Beautiful UI** — green theme, clean design
- 🔔 **Local notifications** — order placed/delivered

## 🚀 Tech Stack

### Mobile (Expo)
| Technology | Version |
|------------|---------|
| React Native | 0.81.5 |
| Expo | 54.0.27 |
| Expo Router | 6.0.17 |
| React Query | 5.x |
| Zod | 4.x |
| TypeScript | 5.9 |

### Backend (API Server)
| Technology | Version |
|------------|---------|
| Express | 5.x |
| Drizzle ORM | 0.x |
| PostgreSQL | 15.x |
| Zod | 4.x |
| OpenAPI | 3.0 |
| esbuild | 0.x |

## 📦 Architecture

```
MediGo
├─── frontend/           │ Expo React Native app
│   ├─── app/            │ Screens (customer/shop)
│   ├─── components/     │ Reusable UI
│   ├─── contexts/       │ AppContext (React Query)
│   └─── assets/         │ Images, icons
├─── backend/            │ Express + PostgreSQL
│   ├─── src/routes/     │ REST API endpoints
│   ├─── src/lib/        │ Seed, logger
│   └─── ...
├─── artifacts/
│   └─── mockup-sandbox/ │ Canvas preview server
├─── lib/
│   ├─── db/             │ Database schema (Drizzle)
│   ├─── api-spec/       │ OpenAPI contract
│   ├─── api-zod/        │ Generated Zod schemas
│   └─── api-client-react/ │ Generated React Query hooks
└─── pnpm-workspace.yaml  │ Monorepo config
```

### Single Shared Shop Architecture
- **Ek dukan** (`id: "main"`) PostgreSQL mein
- **Kai customers** ek hi dukan se connect hote hain
- Order item **embedded** directly in order row
- **No separate items table** — simple and fast

## ⚡ Quick Start

### Prerequisites
- Node.js 24+
- pnpm 9+
- PostgreSQL 15+ (ya Replit built-in DB)

### 1. Clone aur Install

```bash
# Clone karein
git clone https://github.com/aapkaapna/medigo.git
cd medigo

# Dependencies install karein
pnpm install

# Database schema push karein
pnpm --filter @workspace/db run push

# API hooks generate karein
pnpm --filter @workspace/api-spec run codegen
```

### 2. Development

```bash
# API server start karein
pnpm --filter @workspace/backend run dev

# Mobile app start karein
pnpm --filter @workspace/frontend run dev
```

### 3. Type Check

```bash
# Sab packages ka typecheck
pnpm run typecheck

# Build karein
pnpm run build
```

## 📱 Screens

### Customer Flow
1. **Home** → Role select (Customer/Dukandar)
2. **Customer Dashboard** → Medicine list
3. **Buy** → Quantity + Live location + Address
4. **Payment** → UPI/COD + Price breakdown
5. **Order Detail** → Status + ETA countdown
6. **My Orders** → Sabhi order history

### Shopkeeper Flow
1. **Shop Dashboard** → Orders list
2. **Order Detail** → Map + Delivery + Price breakdown
3. **Analytics** → Daily report + 7-day table
4. **Medicines** → Stock management
5. **Setup** → Shop profile

## 🔐 Environment Variables

### Mobile
```env
EXPO_PUBLIC_DOMAIN=your-domain.replit.dev
EXPO_PUBLIC_API_BASE_URL=https://your-api.com
```

### API Server
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=your-secret-key
PORT=8080
```

## 📷 Screenshots

<p align="center">
  <img src="frontend/assets/screenshots/home.png" width="200" alt="Home Screen">
  <img src="frontend/assets/screenshots/customer-dashboard.png" width="200" alt="Customer Dashboard">
  <img src="frontend/assets/screenshots/buy.png" width="200" alt="Buy Screen">
  <img src="frontend/assets/screenshots/payment.png" width="200" alt="Payment Screen">
</p>

## 🚀 Deployment

### Play Store / Amazon App Store

Complete upload guide: [PLAY_STORE_UPLOAD.md](frontend/PLAY_STORE_UPLOAD.md)

### API Server

Replit Deploy, Railway, Render, ya VPS pe deploy karein.

## 🏆 Built With

- **Expo** — React Native framework
- **Express** — Node.js web framework
- **Drizzle ORM** — TypeScript-first SQL
- **React Query** — Server state management
- **Zod** — Schema validation
- **OpenAPI** — API contract

## 👍 Support

Koi sawal ho to **issue** banaein ya **discussion** mein likhein.

## 📄 License

MIT License — Aap azadi se use kar sakte hain.

---

<p align="center">
  <b>Made with ❤️ for Bharat</b>
</p>
