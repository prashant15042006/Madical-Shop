# EAS Build Setup - Complete Guide

Bhai, EAS (Expo Application Services) ke through build karna hai to yeh steps follow karein.

## Step 1: Expo Account Create/Login

1. [expo.dev](https://expo.dev) pe jayein
2. Sign up karein (Google se bhi kar sakte hain)
3. Account verify karein

## Step 2: EAS CLI Login

```bash
cd artifacts/mobile
npx eas login
# Ya
npx eas login --username aapka_username
```

## Step 3: EAS Project Initialize

```bash
cd artifacts/mobile
npx eas init
# Ya automatic:
npx eas build --platform android --profile production
```

## Step 4: Android Keystore Setup

First time build karte waqt:
```bash
npx eas credentials --platform android
```
- Generate new keystore select karein
- Ya existing upload karein

## Step 5: Production Build

```bash
# AAB (Play Store ke liye recommended)
npx eas build --platform android --profile production

# APK (Direct download ke liye)
npx eas build --platform android --profile preview
```

## Step 6: Build Output

- EAS build complete hone ke baad download link milega
- AAB file: Play Store pe upload ke liye
- APK file: Direct share ke liye

## Step 7: Play Store Upload

1. [play.google.com/console](https://play.google.com/console) pe jayein
2. New app create karein
3. AAB file upload karein
4. Store listing fill karein
5. Submit karein

## Alternative: Local Build

Agar EAS use nahi karna:
```bash
cd artifacts/mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

## Important Notes
- Free tier mein 30 builds/month milte hain
- Build time: 5-15 minutes
- AAB size Play Store ke rules ke hisaab se optimize hota hai
