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
Build the production package:
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
    profile/
    notifications/
  lib/            # supabase client, query client, i18n setup
  store/          # Zustand stores (cart, ui, session)
  theme/          # tokens.css, tailwind config, typography
  utils/          # pure helpers (money, dates, pricing, validation)
  types/          # shared domain types
  locales/        # en.json, hi.json
```
