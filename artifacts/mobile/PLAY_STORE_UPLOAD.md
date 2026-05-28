# MediGo - Play Store / Amazon App Store Upload Guide

Bhai, is guide me saari steps diye gaye hai MediGo app ko Play Store aur Amazon App Store pe upload karne ke liye.

---

## 1. Pehle yeh kaam karein

### A. Package Name change karna hai to:

`app.json` mein:
```json
"android": {
  "package": "com.aapkaapna.medigo"
}
```

### B. API Server domain set karna hai:

`lib/api-client.ts` mein `PROD_API_URL` ko apna actual server domain daalein:
```javascript
const PROD_API_URL = "https://apka-apna-server.com"; // apna domain
```

### C. Version badhana hai:

`app.json` mein:
```json
"version": "1.0.1",
"android": {
  "versionCode": 2
}
```

---

## 2. Android APK Build Karna (Local)

### Pehle check karein:
```bash
cd artifacts/mobile
pnpm exec expo --version    # 54.0+ hona chahiye
```

### APK build karein:
```bash
# EAS ke through (recommended)
cd artifacts/mobile
npx eas build --platform android --profile preview

# Ya phir local ke liye:
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

### Build output:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 3. Play Store Upload

### Step 1: Google Play Console
1. [https://play.google.com/console](https://play.google.com/console) pe login karein
2. New app create karein
3. App name: **MediGo**
4. Default language: **Hindi** (ya English)
5. App category: **Shopping** ya **Medical**

### Step 2: Store Listing Fill Karein
- **Short description**: "Aapki dawai, aapke darwaze tak. Customer aur dukandar ek hi app me."
- **Full description**: 
  ```
  MediGo - aapke sheher ki medicine delivery app.

  Customer ke liye:
  - Dawaai khareediye ghar baithe
  - Live location se fast delivery
  - Cash on delivery ya UPI payment

  Dukandar ke liye:
  - Orders manage karein
  - Daily delivery report dekhein
  - Live location se customer tak pahunchein
  ```

### Step 3: Screenshots Upload
8 screenshots minimum (phone size 1080x1920)
Paths: `assets/screenshots/` folder me

### Step 4: Feature Graphic
- Upload: `assets/screenshots/feature-graphic.png` (1024x500)
- Ya `attached_assets/generated_images/play-store-feature.png`

### Step 5: App Bundle Upload
- AAB file upload karein (Play Store me AAB recommended hai)
- Signing key Google manage karega

### Step 6: Content Rating
- Fill questionnaire
- Category: Health

### Step 7: Pricing & Distribution
- Free app
- Countries: India (default)

### Step 8: Submit for Review
- 1-3 din me approval aa jata hai

---

## 4. Amazon App Store Upload

### Step 1: Amazon Developer Console
1. [https://developer.amazon.com](https://developer.amazon.com) pe login karein
2. New app create karein
3. APK upload karein

### Step 2: App Details
- Same description jaise Play Store
- Images: Same screenshots

### Step 3: Binary Upload
- APK upload (Amazon AAB support nahi karta)
- Device targeting: Phone + Tablet

### Step 4: Submit
- Review 2-5 din

---

## 5. API Server Production Setup

### Important: Bhai, API server alag se deploy karna padega!

Options:
1. **Replit Deploy** (free): `suggestDeploy()` use karein
2. **Railway** (free tier): `railway.app` pe connect karein
3. **Render** (free): `render.com` pe deploy karein
4. **VPS** (DigitalOcean, AWS): Full control

### Environment variables:
```
DATABASE_URL=postgresql://...
SESSION_SECRET=...
PORT=8080
```

### Domain connect karein:
- `lib/api-client.ts` me `PROD_API_URL` update karein
- Rebuild aur re-upload karein

---

## 6. Important Checklist

- [ ] Package name final hai
- [ ] API server domain working hai
- [ ] Version aur versionCode badhe hue hai
- [ ] Screenshots liye hue hai
- [ ] Feature graphic ready hai
- [ ] Privacy policy URL ready hai
- [ ] App signing key backup hai
- [ ] All permissions justified hai

---

## 7. Baad me Update Karna

Jab bhi update karein:
1. `version` badhein (1.0.0 → 1.0.1)
2. `versionCode` badhein (1 → 2)
3. Rebuild karein
4. Same AAB/APK upload karein
5. Changelog daalein

---

Bhai, koi problem aaye to pooch lena! Main samjhana hai.
