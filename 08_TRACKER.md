# 08_TRACKER.md: GlowSlot Progress Tracker

Update after every task. Status values: `TODO`, `DOING`, `DONE`, `BLOCKED`.
Last updated: 2026-10-02  |  Current phase: **Phase 6B (DONE)**  |  Prompts: `12_PHASE_PROMPTS.md`

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
| 4C | Notifications and Profile | DONE | 2026-10-02 | 2026-10-02 |
| 4D | Polish | DONE | 2026-10-02 | 2026-10-02 |
| 5A | Database files | DONE | 2026-10-02 | 2026-10-02 |
| 5B | Supabase client and Auth | DONE | 2026-10-02 | 2026-10-02 |
| 5C | Catalogue and user data | DONE | 2026-10-02 | 2026-10-02 |
| 5D | Slots, bookings, realtime | DONE | 2026-10-02 | 2026-10-02 |
| 5E | Cleanup and verification | DONE | 2026-10-02 | 2026-10-02 |
| 6A | Tests and performance | DONE | 2026-10-02 | 2026-10-02 |
| 6B | Android build | DONE | 2026-10-02 | 2026-10-02 |

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

### Phase 4C
| ID | Task | Status | Notes |
|---|---|---|---|
| 4C.1 | S21 Notifications | DONE | Grouped by day (Today, Yesterday, Earlier), unread dot, mark read |
| 4C.2 | S22 Profile Main | DONE | Account, Preferences, Support groups, logout, delete account |
| 4C.3 | S23 Edit Profile | DONE | Name, phone, gender, email, avatar |
| 4C.4 | S24 Saved Addresses | DONE | Address list with add/edit/delete, reuses S07 modal |
| 4C.5 | S25 Favourite Salons | DONE | List of bookmarked salons, links to S04 Salon Detail |
| 4C.6 | S26 Wallet & Points | DONE | Points balance, conversion banner, transaction history |
| 4C.7 | S27 Refer & Earn | DONE | Referral code, copy trigger, O10 native share, Have a Code card (REF-5) |
| 4C.8 | S28 Settings | DONE | O07 Language picker, dark mode switch, notification toggles |
| 4C.9 | S29 & S30 Support & Legal | DONE | S29 Help & FAQ accordion, S30 Terms of Service & Privacy Policy |
| 4C.10 | Dialogs & Home Wiring | DONE | O07, O08, O09, O10; Home bell, avatar, points, refer wired |

### Phase 4D
| ID | Task | Status | Notes |
|---|---|---|---|
| 4D.1 | Loading/Empty/Error states | DONE | Skeletons on Salon List, Shop, Home, Bookings |
| 4D.2 | Pull to Refresh | DONE | PullToRefresh on S01 Home, S03 Salons, S10 Bookings, S18 Shop |
| 4D.3 | Offline handling & banners | DONE | useNetworkStatus hook, OfflineBanner, disabled checkout CTA |
| 4D.4 | Accessibility compliance | DONE | S05 slot screen-reader announcements, focus rings, contrast |
| 4D.5 | Viewport & language fits | DONE | Verified 360px & 412px, Hindi text fit, light/dark themes |

### Phase 5B
| ID | Task | Status | Notes |
|---|---|---|---|
| 5B.1 | @supabase/supabase-js & client | DONE | src/lib/supabase.ts with session persistence |
| 5B.2 | authService implementation | DONE | sendOtp, verifyOtp, signInWithEmail, signOut, deleteAccount |
| 5B.3 | Profiles table integration | DONE | getProfile, updateProfile connected to profiles table |
| 5B.4 | onAuthStateChange & AppShell | DONE | Session subscription and token refresh in AppShell |
| 5B.5 | S15, S16, S17, S23 connected | DONE | Real auth & profiles integration with mock fallback |

### Phase 5C
| ID | Task | Status | Notes |
|---|---|---|---|
| 5C.1 | Catalogue Supabase services | DONE | salonService, productService, couponService |
| 5C.2 | User data Supabase services | DONE | addressService, notificationService, userService (wallet) |
| 5C.3 | Storage avatar upload | DONE | storageService avatar upload to 'avatars' bucket |
| 5C.4 | Favorites & Wishlist sync | DONE | useFavoritesStore & useWishlistStore Supabase sync |
| 5C.5 | Mock fallback preservation | DONE | VITE_USE_MOCK_DATA guards across all services |

### Phase 5D
| ID | Task | Status | Notes |
|---|---|---|---|
| 5D.1 | slotService RPCs & Realtime | DONE | holdSlot, releaseSlot, subscribeToSlots channel per date |
| 5D.2 | bookingService RPCs & Realtime | DONE | createBooking, cancelBooking, rescheduleBooking, subscribe |
| 5D.3 | S05 server held_until timer | DONE | Hold timer follows server timestamp; released on back/expiry |
| 5D.4 | Server bill totals & RLS reviews | DONE | Server calculated bill items; review insert only for completed |
| 5D.5 | Friendly error mapping | DONE | services/errors.ts mapping error codes to user messages |

### Phase 5E
| ID | Task | Status | Notes |
|---|---|---|---|
| 5E.1 | Mock path isolation | DONE | Mock adapters reachable only when VITE_USE_MOCK_DATA is true |
| 5E.2 | Firebase & Service Role Audit | DONE | Confirmed zero Firebase and zero service-role keys |
| 5E.3 | Backend verification test suite | DONE | 14 automated tests for RLS, hold, pricing, refunds, reschedules |
| 5E.4 | All Phase 5 criteria verified | DONE | Passed 45 unit tests across 9 test files |

### Phase 6A
| ID | Task | Status | Notes |
|---|---|---|---|
| 6A.1 | Unit tests for utils | DONE | validators.test.ts, dates.test.ts, pricing, money, i18n |
| 6A.2 | E2E integration test | DONE | e2e_booking_lifecycle.test.ts (OTP -> Hold -> Book -> Cancel) |
| 6A.3 | Code splitting & bundle size | DONE | Split vendor chunks, Home JS gzip is ~64.4 KB (budget 250 KB) |
| 6A.4 | Engineering Practices Audit | DONE | All 8 checklist items passed |

### Phase 6B
| ID | Task | Status | Notes |
|---|---|---|---|
| 6B.1 | Capacitor core & plugins | DONE | Installed @capacitor/core, android, geolocation, share, app |
| 6B.2 | capacitor.config.json | DONE | appId: com.glowslot.app, appName: GlowSlot |
| 6B.3 | Hardware back button & safe area | DONE | CapacitorApp backButton listener, viewport-fit=cover |
| 6B.4 | Location rationale & Native share | DONE | LocationSheet rationale banner, ReferEarn native share |
| 6B.5 | README & Keystore security | DONE | Android build guide, keystore ignored in .gitignore |
| 6B.6 | Referrals Table | DONE | Created referrals table and RLS policies |
| 6B.7 | useReferral hook | DONE | Implemented hook for referral code management |
| 6C.1 | CancellationPolicyModal | DONE | New informational component with refund estimates |

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
| 2026-10-02 | Phase 4C Notifications & Profile Complete | S21-S30, O07-O10, favorites store, wallet points history, wired home shortcuts |
| 2026-10-02 | Phase 4D Polish Complete | Pull-to-refresh, skeleton shimmers, offline detection, accessibility compliance |
| 2026-10-02 | Phase 5B Supabase Auth Complete | @supabase/supabase-js, authService, profiles table, onAuthStateChange |
| 2026-10-02 | Phase 5C Catalogue & User Data Complete | Supabase queries for salons, products, addresses, notifications, wallet, storage |
| 2026-10-02 | Phase 5D Slots, Bookings, Realtime | Supabase RPCs, hold_slot, Realtime subscriptions, server bill totals |
| 2026-10-02 | Phase 5E Cleanup & Verification | Mock path isolation, zero Firebase audit, 45 automated tests pass |
| 2026-10-02 | Phase 6A Tests & Performance | 59 automated tests across 12 suites pass, 64.4 KB gzipped main JS |
| 2026-10-02 | Phase 6B Android (Capacitor) Complete | Capacitor core, android, geolocation, share, app id com.glowslot.app |
| 2026-10-02 | Auth Migration (Email + Password) | Replaced phone OTP with Email + Password registration & login |

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
| 2026-10-02 | Phase 4C | profile, favorites & settings tests | PASS | Verified salon favorites toggle, language/theme switches, logout |
| 2026-10-02 | Phase 4D | polish & offline resilience audit | PASS | All 30 unit tests pass, clean build with zero errors |
| 2026-10-02 | Phase 5B | Supabase Auth & Session tests | PASS | Verified async verifyOtp, email signin fallback, profile sync, logout |
| 2026-10-02 | Phase 5C | Catalogue & User Data audit | PASS | All 31 unit tests pass, clean build with zero errors |
| 2026-10-02 | Phase 5D | Booking engine & Realtime audit | PASS | All 31 unit tests pass, clean build with zero errors |
| 2026-10-02 | Phase 5E | Phase 5 checklist test suite | PASS | 45 tests across 9 test files pass, zero errors |
| 2026-10-02 | Phase 6A | Full Test & Performance Suite | PASS | 59 tests across 12 suites pass, 64.4 KB gzipped main JS |
| 2026-10-02 | Phase 6B | Android Capacitor Build Audit | PASS | 59 tests pass, clean build, zero errors |

---

## 6. Blockers

| Date | Blocker | Owner | Status |
|---|---|---|---|
| - | - | - | - |



