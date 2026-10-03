# GlowSlot

GlowSlot is an original salon & grooming booking application for India, featuring smart time-based slot pricing, at-salon and at-home grooming services, and products.

---

## Getting Started

### 1. Installation
Install the project dependencies:
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your Supabase credentials in `.env` (or set `VITE_USE_MOCK_DATA=true` for mock data during development phases).

### 3. Development Server
Run the development server on port 3000:
```bash
npm run dev
```

### 4. Build
Build the web production package:
```bash
npm run build
```

### 5. Type Check & Lint
Run type checking and linting:
```bash
npm run lint
```

### 6. Tests
Run test suites using Vitest:
```bash
npm test
```

---

## Android (Capacitor) Build Guide

### 1. Initialize & Add Android Platform
Ensure the web app build is up to date, then add the Android platform:
```bash
npm run build
npx cap add android
```

### 2. Sync Assets & Plugins
Copy web assets and update native plugins:
```bash
npx cap sync android
```

### 3. Open in Android Studio
Open the generated Android project in Android Studio:
```bash
npx cap open android
```

### 4. App Icon & Splash Assets
Place branded app icons and splash screens in `/assets/brand`:
- `app_icon.png` (1024x1024)
- `splash.png` (2732x2732)

Generate native launcher resources with `@capacitor/assets`:
```bash
npx @capacitor/assets generate --android
```

### 5. Production Release Build (Keystore Security)
To build a signed release APK or Android App Bundle (AAB):
1. In Android Studio, go to **Build > Generate Signed Bundle / APK**.
2. Select **Android App Bundle** or **APK**.
3. Generate or choose your release keystore.
4. **Keystore Security Note**: Never commit keystore files (`*.jks`, `*.keystore`) or passwords to git repository. Keystores are strictly listed in `.gitignore`.

---

## Project Structure
Follows `Engineering-Practices.md`:
```
src/
  app/            # router, providers, app shell
  components/     # reusable UI (Button, Chip, Card, Sheet, Toast, Skeleton)
  features/       # domain feature modules
    auth/
    home/
    salons/
    slots/
    athome/
    cart/
    bookings/
    shop/
    notifications/
    profile/
  store/          # Zustand state stores
  utils/          # pure functions (pricing, money, validators)
  theme/          # CSS design tokens
```
