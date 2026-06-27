# 💌 Envelope Show

A live, game-show-style web app for a family wedding **envelope-opening ceremony**.
An operator drives the show from a phone (`/admin`); the celebration plays out
full-screen on a TV/projector (`/display`) — updating **instantly** over Supabase
Realtime.

- 🎛️ **`/admin`** — mobile-first control panel: import guests, search, select, enter amounts, reveal.
- 📺 **`/display`** — full-screen animated stage: welcome → guest selected → amount reveal, with live stats and a 👑 *King of the Envelopes* leaderboard.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (DB + Realtime)**.

---

## ✨ Features

- **Excel import** — upload a spreadsheet; guest names are read from the first column (duplicates skipped).
- **Live control** — selecting a guest or revealing an amount in `/admin` updates `/display` in real time.
- **Reveal animations by amount tier:**
  | Amount (₪) | Animation |
  |---|---|
  | `< 500` | ✨ subtle sparkle |
  | `500–999` | 🎊 small confetti |
  | `1000–1499` | 🎉 big confetti |
  | `1500–1999` | 🎆 fireworks |
  | `2000+` | 👑 gold royal + crown |
  | **exactly `1717`** | 🍀 special **“Lucky 17”** |
- **Live stats** — opened/total, total raised, average gift, and the current top giver.
- **Quick add** — add a walk-up guest and reveal in one step.
- **Admin controls** — back to idle, mark ready, reveal, undo last amount.
- **Excel export** — download all results (name, amount, opened, created_at, updated_at).
- **Hebrew, fully RTL** — the entire UI is in Hebrew with a right-to-left layout and an elegant Hebrew display font (Frank Ruhl Libre); numbers and currency are bidi-isolated so `₪1,500` never flips.

---

## 🚀 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to <https://supabase.com> → **New project**.
2. Wait for it to finish provisioning.

### 3. Run the SQL schema

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the contents of [`supabase-schema.sql`](./supabase-schema.sql) and click **Run**.

This creates the `guests` and `event_state` tables, the single `event_state`
control row (`id = 'main'`), the `updated_at` triggers, permissive RLS policies,
and enables Realtime on both tables.

### 4. Add environment variables

Copy the example file and fill in your project values
(**Project Settings → API** in the Supabase dashboard):

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 5. Run the dev server

```bash
npm run dev
```

- Admin:   <http://localhost:3000/admin>
- Display: <http://localhost:3000/display>

---

## 🎬 Running the ceremony

1. Open **`/display`** on the TV/projector (fullscreen the browser — `F11` / `⌃⌘F`).
2. Open **`/admin`** on your phone (same network or deployed URL).
3. Import the guest list once (Excel upload), or quick-add as you go.
4. For each envelope: **search → tap the guest** (TV shows their name + “Ready?”) →
   optionally **Mark as Ready** → type the amount → **Reveal / Add Amount** 🎉.
5. Watch the stats and the 👑 leaderboard climb. **Export** to Excel at the end.

> **Tip:** The display has a small status dot (green = live). If it ever shows
> “Reconnecting…”, just refresh that tab — all state lives in Supabase, so nothing
> is lost.

---

## 🗂️ Project structure

```
app/
  layout.tsx          Root layout + fonts + global styles
  page.tsx            Landing page (links to admin / display)
  admin/page.tsx      Mobile-first control panel
  display/page.tsx    Full-screen animated TV display
components/
  Name.tsx            Bidi-safe (Hebrew/English) name renderer
  SetupNotice.tsx     Shown when env vars are missing
  admin/              ExcelUpload, QuickAdd, GuestSearch, GuestCard, SelectedPanel, StatsStrip
  display/            IdleScreen, SelectedScreen, RevealScreen, StatsBar, Envelope
lib/
  supabase.ts         Supabase client (singleton)
  types.ts            Guest, EventState, EventStats, ScreenStatus
  utils.ts            Currency formatting, amount tiers, stats, bidi helpers
  excel.ts            Import (first column) / export helpers (xlsx)
  celebrate.ts        canvas-confetti celebration engine
  useEventShow.ts     Realtime data hook + all mutations (shared by both pages)
supabase-schema.sql   Database schema, triggers, RLS, realtime
```

---

## 🚢 Deploy

Deploy to **Vercel** (recommended for Next.js):

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as
   environment variables.
4. Deploy, then open `/display` on the TV and `/admin` on your phone.

---

## 🔒 A note on security

This app is intentionally **open** (anon key, permissive RLS, real names &
amounts shown) because it’s a private, in-person family event with no privacy
mode. Don’t share the public URL beyond the people running the show. To lock it
down later, swap the RLS policies in `supabase-schema.sql` for authenticated-only
ones and add Supabase Auth.
