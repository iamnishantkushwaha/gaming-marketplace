# GameTrade — Clickable Demo

A fully static front-end demo of GameTrade, a two-sided marketplace for game accounts, in-game
currency, and boosting services (modeled on Gameboost.com / Eldorado.gg). Built to the attached
build spec: four role-based experiences (Buyer, Seller, Admin, Support Agent), ~40 screens, all
backed by in-memory mock data — no real backend, auth, or payments.

## Getting started

This project was hand-built in an environment without internet/npm access, so dependencies have
**not** been installed or build-verified yet. On your machine, with normal internet access:

```bash
cd gaming-marketplace
npm install
npm run dev
```

Then open http://localhost:3000 — you'll land on the role picker.

If `npm run dev` surfaces any TypeScript/lint issues (small typos are possible since this was
never compiled), they should be quick to fix — most likely a missing prop type or an unused import.
Run `npm run build` to catch everything at once.

## What's implemented

- **Role picker** → Buyer, Seller, Admin, Support Agent, each with its own nav shell.
- **Buyer**: marketplace home (hero carousel, category tiles, recommended/newest grids), search
  with live filters/sort/pagination, listing detail (gallery, escrow info, reviews, similar
  listings, wishlist), 3-step checkout, orders (list + detail with timeline, confirm delivery,
  report an issue → dispute, leave a review), messages (inbox + conversation, canned starter
  message, attachments), wallet (balance, add funds, transactions, payment methods), profile +
  KYC verification, notifications, and a read-only public seller profile.
- **Seller**: dashboard (stats, earnings chart via Recharts, orders needing attention, reviews),
  listings (table with pause/activate/delete, 4-step create wizard, edit page with live stats),
  incoming orders (mark delivered, respond to disputes), messages, earnings (payouts + commission
  history), reviews (with seller replies), verification, settings.
- **Admin**: dashboard (GMV/commission trend chart), users (ban/unban, verification approve/reject),
  listings (moderation queue with approve/reject, all listings, remove), orders (force-refund /
  force-release), disputes (internal notes, resolve, escalate), payments (transactions, commission
  report with charts), security (flagged activity), settings (categories, commission rates).
- **Support Agent**: dashboard, live chat (queue with claim-on-open, canned responses), disputes
  (shared view with Admin), user lookup.

All state (orders, listings, disputes, messages, balances, verification, bans, etc.) lives in a
single React context (`src/lib/store.tsx`) backed by seed data in `src/lib/mock-data.ts`, so
actions taken in one role are reflected everywhere else that reads the same record — e.g. a
seller marking an order "Delivered" instantly shows up on the buyer's Order detail page, and
approving KYC as Admin flips that same user's own Verification page.

State is in-memory only and resets on a full page reload, matching the spec.

## Structure

```
src/
  app/            Next.js App Router routes, grouped by role (buyer/, seller/, admin/, support/)
  components/
    ui/           Generic primitives (Button styles via CSS classes, Modal, SideSheet, Table, Tabs, Badge, Stars, Toast...)
    shared/       Cross-role components (ListingCard, MessageThread, ConversationList, OrderTimeline, DisputeDetail, VerificationFlow)
    layout/       AppShell (header/nav/mobile drawer) + RoleGuard
  lib/
    types.ts      All data model types
    mock-data.ts  Seed data for every entity
    store.tsx     App-wide state (React context + reducer) and selector hooks
    format.ts     Money/date/id helpers
```

## Notes

- Images are pulled from Unsplash/Pravatar URLs at runtime — an internet connection is needed to
  see them render (swap `next.config.mjs`'s `images.remotePatterns` if you point at different
  hosts).
- Tailwind is configured with a dark, gamer-skewed palette in `tailwind.config.ts`.
- No real authentication, payments, or file uploads — all "stub" per the spec (dummy card fields,
  fake upload chips, etc).
