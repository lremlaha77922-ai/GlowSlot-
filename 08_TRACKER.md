# 08_TRACKER.md: GlowSlot Progress Tracker

Update after every task. Status values: `TODO`, `DOING`, `DONE`, `BLOCKED`.
Last updated: 2026-10-02  |  Current phase: **Phase 0 (DONE)**  |  Prompts: `12_PHASE_PROMPTS.md`

---

## 1. Phase Summary

| Phase | Name | Status | Started | Finished |
|---|---|---|---|---|
| 0 | Project setup | DONE | 2026-10-02 | 2026-10-02 |
| 1 | Foundation and Home | TODO | | |
| 2 | At Salon and Slot Picker | TODO | | |
| 3 | At Home, Checkout, Bookings | TODO | | |
| 4A | Onboarding and Auth screens | TODO | | |
| 4B | Shop | TODO | | |
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

---

## 3. Decisions Log

| Date | Decision | Reason |
|---|---|---|
| 2026-10-02 | Supabase only, no Firebase | Postgres, RLS and RPC suit booking logic |
| 2026-10-02 | Capacitor for Android | One codebase, fast delivery |
| 2026-10-02 | Money in integer paise | Avoid float errors |
| 2026-10-02 | Mock payment in MVP | Gateway later |
| 2026-10-02 | Phase 0 Setup Complete | Foundation established according to Design.md and Engineering-Practices.md |

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

---

## 6. Blockers

| Date | Blocker | Owner | Status |
|---|---|---|---|
| - | - | - | - |
