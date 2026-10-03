# 08_TRACKER.md: GlowSlot Progress Tracker

Update after every task. Status values: `TODO`, `DOING`, `DONE`, `BLOCKED`.
Last updated: 2026-10-02  |  Current phase: **Phase 4B (DONE)**  |  Prompts: `12_PHASE_PROMPTS.md`

---

## 1. Phase Summary

| Phase | Name | Status | Started | Finished |
|---|---|---|---|---|
| 0 | Project setup | DONE | 2026-10-02 | 2026-10-02 |
| 1 | Foundation and Home | DONE | 2026-10-02 | 2026-10-02 |
| 2 | At Salon and Slot Picker | DONE | 2026-10-02 | 2026-10-02 |
| 3 | At Home, Checkout, Bookings | DONE | 2026-10-02 | 2026-10-02 |
| 4A | Onboarding and Auth screens | DONE | 2026-10-02 | 2026-10-02 |
| 4B | Shop | DONE | 2026-10-02 | 2026-10-02 |
| 4C | Notifications and Profile | TODO | | |
| 4D | Polish | TODO | | |
| 5A | Database files | TODO | | |
| 5B | Supabase client and Auth | TODO | | |
| 5C | Catalogue and user data | TODO | | |
| 5D | Slots, bookings, realtime | TODO | | |
| 5E | Cleanup and verification | TODO | | |
| 6A | Tests and performance | TODO | | |
| 6B | Android build | TODO | | |

---

## 2. Task Tracker

### Phase 0
| ID | Task | Status | Notes |
|---|---|---|---|
| 0.1 | Vite + React + TS project | DONE | Verified build & config |
| 0.2 | Tailwind, ESLint, Prettier, Vitest | DONE | Configured and verified |
| 0.3 | Folder structure | DONE | Created per Engineering-Practices.md |
| 0.4 | Theme tokens (light and dark) | DONE | src/theme/tokens.css & index.css |
| 0.5 | i18n (en, hi) | DONE | src/lib/i18n.ts, en.json, hi.json + test |
| 0.6 | `.env.example` and `.gitignore` entry | DONE | Supabase env vars added, .env ignored |

### Phase 1
| ID | Task | Status | Notes |
|---|---|---|---|
| 1.1 | Base components | DONE | Button, Chip, Card, Input, Sheet, Toast, Skeleton, EmptyState, AddStepper |
| 1.2 | App shell and tabs | DONE | AppShell, BottomTabBar (5 tabs), ErrorBoundary, OfflineBanner |
| 1.3 | Zustand stores | DONE | useCartStore, useUIStore, useSessionStore |
| 1.4 | Mock data | DONE | src/data/mockData.ts (banners, services, salons, areas) |
| 1.5 | Home screen | DONE | S01 Home (Header, Carousel, Quick Services, Deals, Salons, Refer) |
| 1.6 | Cart (basic) | DONE | S02 Cart (Item list, Stepper, Price breakdown, Empty state) & O01 Location |

### Phase 2
| ID | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Salon list and filters | DONE | S03 At Salon list, search, suggestions, gender toggle, category chips |
| 2.2 | Salon detail | DONE | S04 Salon Detail with gallery, tabs (Services, Packages, Reviews, About), sticky bar |
| 2.3 | Pricing util and tests | DONE | utils/pricing.ts and pricing.test.ts (morning off-peak, peak, free slots) |
| 2.4 | Slot Picker UI and states | DONE | S05 Smart Slot Picker (all 6 states, date strip, legend, screen-reader labels) |
| 2.5 | Hold timer logic | DONE | 5-minute local hold countdown, auto-reset on expiry, Continue to S02 Cart |

### Phase 3
| ID | Task | Status | Notes |
|---|---|---|---|
| 3.1 | S06 At Home screen | DONE | Hero, gender toggle, 2x2 categories, packages, hygiene badges |
| 3.2 | Address picker & CRUD | DONE | O05 AddressPickerSheet & S07 AddEditAddressModal with localStorage |
| 3.3 | S08 Checkout & Coupons | DONE | O04 Offers sheet, coupon code validator, points toggle (20% cap) |
| 3.4 | Payment & Success | DONE | paymentService mock adapter, S09 Booking Success with calendar & directions |
| 3.5 | S10 Bookings List & S11 | DONE | Upcoming, Completed, Cancelled tabs, S11 Booking Detail |
| 3.6 | Cancel, Reschedule, Review | DONE | O06 Cancel sheet (>4h 100%, 1-4h 50%, <1h 0%), S12 Review, Reschedule (>2h) |

### Phase 4A
| ID | Task | Status | Notes |
|---|---|---|---|
| 4A.1 | S13 Splash Screen | DONE | Session detection, routes to Onboarding/Login/Main |
| 4A.2 | S14 Onboarding | DONE | 3 slides, dot indicators, Skip & Get Started |
| 4A.3 | S15 Login Screen | DONE | +91 phone validation, Send OTP, Continue as guest, terms link |
| 4A.4 | S16 OTP Verify | DONE | 6 auto-advancing boxes, 30s resend timer, 123456 mock code |
| 4A.5 | S17 Profile Setup | DONE | Full name, gender selection, location permission card |
| 4A.6 | Guest Mode & Interceptors | DONE | Guest browse allowed; booking redirects to login and returns |

### Phase 4B
| ID | Task | Status | Notes |
|---|---|---|---|
| 4B.1 | S18 Shop List | DONE | Category chips (Hair, Beard, Skin, Tools), 2-column grid, ADD stepper |
| 4B.2 | S19 Product Detail | DONE | Gallery, description, rating, highlights, Add to Cart, wishlist heart |
| 4B.3 | S20 Wishlist | DONE | Saved products list, quick Add to Cart and remove, localStorage |
| 4B.4 | 12 Mock Products | DONE | 3 products per category in src/data/mockProducts.ts |
| 4B.5 | Cart & Checkout Integration | DONE | Products add to cart with image & type, calculate in totals |
| 4B.6 | Enable Shop Tab | DONE | BottomTabBar 5th tab enabled |

---

## 3. Decisions Log

| Date | Decision | Reason |
|---|---|---|
| 2026-10-02 | Supabase only, no Firebase | Postgres, RLS and RPC suit booking logic |
| 2026-10-02 | Capacitor for Android | One codebase, fast delivery |
| 2026-10-02 | Money in integer paise | Avoid float errors |
| 2026-10-02 | Mock payment in MVP | Gateway later |
| 2026-10-02 | Phase 0 Setup Complete | Foundation established according to Design.md and Engineering-Practices.md |
| 2026-10-02 | Phase 1 Foundation & Home Complete | App shell, S01, S02, O01, base components, and stores built |
| 2026-10-02 | Phase 2 At Salon & Slot Picker Complete | S03, S04, S05, O02, O03, pricing.ts, 5-min hold timer, and cart integration built |
| 2026-10-02 | Phase 3 Booking Journey Complete | S06, S07, S08, S09, S10, S11, S12, O04, O05, O06, coupons, refund tiers, reschedule built |
| 2026-10-02 | Phase 4A Onboarding & Auth Complete | S13, S14, S15, S16, S17, mock OTP, guest mode with return targets built |
| 2026-10-02 | Phase 4B Shop Complete | S18, S19, S20, 12 products, wishlist store, cart & checkout totals integration built |

---

## 4. Bug and Issue Log

| ID | Date | Phase | Description | Severity | Status | Fix notes |
|---|---|---|---|---|---|---|
| - | - | - | - | - | - | - |

---

## 5. Test Log

| Date | Phase | Test | Result | Notes |
|---|---|---|---|---|
| 2026-10-02 | Phase 0 | i18n language switch test | PASS | Verified en and hi string resolution |
| 2026-10-02 | Phase 1 | money format & tax calculation | PASS | Verified paise formatting & tax percent |
| 2026-10-02 | Phase 1 | cart calculations & stepper | PASS | Verified add, increment, decrement, total |
| 2026-10-02 | Phase 2 | pricing algorithm unit tests | PASS | Verified off-peak (0.6x), afternoon (0.9x), peak (1.2x/1.3x), free slots (Rs.0) |
| 2026-10-02 | Phase 3 | booking cancellation & refund tests | PASS | Verified refund tiers (>4h 100%, 1-4h 50%, <1h 0%) and coupon rules |
| 2026-10-02 | Phase 4A | auth and session unit tests | PASS | Verified mock OTP 123456, guest mode, profile update, onboarding |
| 2026-10-02 | Phase 4B | shop, products & wishlist tests | PASS | Verified 12 products across 4 categories, cart add, wishlist toggle |

---

## 6. Blockers

| Date | Blocker | Owner | Status |
|---|---|---|---|
| - | - | - | - |



