# 10_memory.md: GlowSlot Project Memory

Context file for AI sessions. Read this first, then `08_TRACKER.md`. Update it at the end of every phase. Keep it short and current; delete outdated lines instead of piling up history.

Last updated: 2026-10-02  |  Current phase: **Phase 0 (DONE)**

---

## 1. Project in One Paragraph

GlowSlot is an original Android salon booking app for India. Users book at-salon and at-home grooming, pick time slots with time-based pricing (cheaper off-peak, free-offer slots), and buy grooming products. Built with React + TypeScript + Tailwind, packaged for Android with Capacitor, backend is **Supabase only**. Inspired only by general marketplace functionality; no names, logos, taglines or assets from any existing app.

---

## 2. Fixed Decisions

- Supabase only (Auth, Postgres, Storage, Realtime, RPC). No Firebase.
- Money in integer paise; display as Rs.
- Slot hold 5 minutes; slots 30 minutes, 08:00 AM to 08:00 PM.
- Booking, hold, cancel logic lives in Postgres RPC functions; client never sets prices.
- State: Zustand (UI) + TanStack Query (server).
- Mock payment in MVP; payment adapter ready for a real gateway later.
- English and Hindi supported from the start.
- Android via Capacitor (revisit only if native is required).

---

## 3. Current Status

| Item | Value |
|---|---|
| Phase | 6A (Tests & Performance) - DONE |
| Last completed task | 6A.4 Hardening, 59 automated tests across 12 suites, bundle optimization |
| Next task | Phase 6B: Android build (awaiting prompt P6B) |
| Known blockers | None |
| Known bugs | None |
