# xBP Mirror Feature — Integration Guide

A step-by-step walkthrough for adding the mirror feature to your existing xBP app.
Follow the phases in order. Do not skip steps.

---

## What you're adding

| Piece | What it does |
|---|---|
| Supabase table | Stores encrypted blobs keyed by token — the relay |
| `types/mirror.ts` | All TypeScript types for the feature |
| `lib/supabase.ts` | Supabase client (no auth, no sessions) |
| `utils/mirror.ts` | Token gen, link building, payload helpers |
| `utils/mirrorCrypto.ts` | AES-256-CBC encrypt/decrypt (crypto-js) |
| `store/mirrorStore.ts` | Zustand slice for mirror state |
| `hooks/useObservers.ts` | CRUD for observer profiles + secure key management |
| `hooks/useMirrorPublish.ts` | Encrypts + pushes to Supabase (sender side) |
| `hooks/useMirrorSync.ts` | Polls + decrypts from Supabase (observer side) |
| `components/ObserverCard.tsx` | Animated status card for each observer |
| `components/MirrorSetupSheet.tsx` | Slide-up sheet to create/manage share link |
| `components/ObserverView.tsx` | Full-screen read-only data view |
| `app/observe/[token].tsx` | Deep link landing page |
| `app/(tabs)/mirrors.tsx` | New Mirrors tab |
| `app/mirrors/[id].tsx` | Detail screen per observer |

**Security model:**
- The share link contains the `read_token` (relay key) and `encryptionKey` (AES key).
- Supabase only ever stores the **encrypted** blob — it cannot read your data.
- The `publisher_token` (write secret) lives only in `expo-secure-store` on the sender's device. Observers cannot write anything, even if they try.
- All secrets are stored in `expo-secure-store`. Nothing sensitive ever touches Zustand, MMKV, or AsyncStorage.

---

## Phase 1 — Install dependencies

Run these from your project root:

```bash
# Supabase client
npx expo install @supabase/supabase-js

# Required polyfill for Supabase's crypto usage in React Native
npx expo install react-native-get-random-values

# AES encryption (pure JS — works in all Expo environments)
npm install crypto-js
npm install --save-dev @types/crypto-js

# URL polyfill (needed for parseMirrorLink on Android)
npx expo install react-native-url-polyfill
```

After installing, open your `app/_layout.tsx` (the root layout) and add these two imports
**at the very top of the file**, before anything else:

```typescript
// app/_layout.tsx — add to top
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
```

> **Why at the top?** Both are polyfills that must run before any other code uses
> `crypto.getRandomValues` or the `URL` constructor. Order matters.

---

## Phase 2 — Set up Supabase

### 2a. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier is fine).
2. Wait for it to finish provisioning (~1 min).

### 2b. Run the schema

1. In the Supabase dashboard, open **SQL Editor**.
2. Paste the entire contents of `supabase/schema.sql` from this ZIP.
3. Click **Run**. You should see "Success. No rows returned."
4. Verify in **Table Editor** that `xbp_mirror_blobs` appears.

### 2c. Get your API keys

In the Supabase dashboard → **Settings → API**:

- Copy **Project URL** (e.g. `https://abcdefgh.supabase.co`)
- Copy **anon / public** key (the long `eyJ...` string)

> **The anon key is safe to ship in the app.** Row Level Security ensures
> observers can only read rows by token, and can never write without the
> publisher_token that only Mom's device holds.

### 2d. Add env vars to your app config

Open `app.json` and add the `extra` block:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://YOUR-PROJECT-REF.supabase.co",
      "supabaseAnonKey": "YOUR-ANON-KEY"
    }
  }
}
```

Or if you use `app.config.ts`:

```typescript
export default {
  expo: {
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
```

Then create a `.env` file at your project root (add it to `.gitignore`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

---

## Phase 3 — Copy the source files

Copy everything from `src/` in this ZIP into your project, maintaining the folder structure:

```
src/types/mirror.ts         →  types/mirror.ts
src/lib/supabase.ts         →  lib/supabase.ts
src/utils/mirror.ts         →  utils/mirror.ts
src/utils/mirrorCrypto.ts   →  utils/mirrorCrypto.ts
src/store/mirrorStore.ts    →  store/mirrorStore.ts
src/hooks/useObservers.ts   →  hooks/useObservers.ts
src/hooks/useMirrorPublish.ts → hooks/useMirrorPublish.ts
src/hooks/useMirrorSync.ts  →  hooks/useMirrorSync.ts
src/components/ObserverCard.tsx     →  components/ObserverCard.tsx
src/components/MirrorSetupSheet.tsx →  components/MirrorSetupSheet.tsx
src/components/ObserverView.tsx     →  components/ObserverView.tsx
src/app/observe/[token].tsx →  app/observe/[token].tsx
src/app/(tabs)/mirrors.tsx  →  app/(tabs)/mirrors.tsx
src/app/mirrors/[id].tsx    →  app/mirrors/[id].tsx
```

Create the `app/mirrors/` and `app/observe/` directories if they don't exist.

---

## Phase 4 — Verify and fix imports

Open each copied file and check the `⚠️  VERIFY` comments. There are three categories:

### 4a. BPLog type

Open `types/mirror.ts`. The top of the file imports:

```typescript
import type { BPLog } from '@/types';
```

Open your `types/index.ts` and confirm `BPLog` is exported and has at least:

```typescript
type BPLog = {
  id: string;
  systolic: number;
  diastolic: number;
  bpm: number;
  timestamp: string;   // ISO 8601
  notes?: string;
};
```

If the field names differ (e.g. `pulse` instead of `bpm`, or `date` instead of `timestamp`),
update the references in `ObserverView.tsx` and `ObserverCard.tsx` to match.

### 4b. useBPLogs hook

Open `hooks/useMirrorPublish.ts`. Find:

```typescript
import { useBPLogs } from '@/hooks/useBPLogs';
// ...
const { data: logs = [] } = useBPLogs();
```

Confirm your `useBPLogs` hook returns an object with a `data` field containing `BPLog[]`.
If the return shape is different (e.g. `{ logs }` or just `BPLog[]`), adjust the destructuring.

### 4c. UI components

All components import from `@/components/ui/Text` and `@/components/ui/Button`.
You already have these in `components/ui/`. The only thing to verify:

- **Button** — check it accepts `variant` (`'primary' | 'outline' | 'destructive'`),
  `size` (`'sm'`), `loading`, and `disabled` props. Add any missing props.
- **BPDisplay** in `ObserverView.tsx` — check it accepts `systolic`, `diastolic`,
  `bpm`, `timestamp`, and optionally `readonly`. If `readonly` isn't a prop yet,
  either add it (so the edit button hides) or just remove the prop from `ObserverView.tsx`.

### 4d. Storage adapter in mirrorStore.ts

The store uses `AsyncStorage` by default. If your existing stores use MMKV, open
`store/mirrorStore.ts` and swap the storage adapter:

```typescript
// Replace this:
import AsyncStorage from '@react-native-async-storage/async-storage';
// ...
storage: createJSONStorage(() => AsyncStorage),

// With your MMKV adapter, e.g.:
import { storage } from '@/store/storage';
// ...
storage: createJSONStorage(() => storage),
```

---

## Phase 5 — Add the Mirrors tab

Open `app/(tabs)/_layout.tsx`. Add a new `<Tabs.Screen>` entry for mirrors:

```typescript
// app/(tabs)/_layout.tsx

<Tabs.Screen
  name="mirrors"
  options={{
    title: 'Mirrors',
    tabBarIcon: ({ color, size }) => (
      // Use whatever icon library you're already using
      // e.g. @expo/vector-icons, lucide-react-native, etc.
      <YourIcon name="eye" color={color} size={size} />
    ),
  }}
/>
```

Place it after your existing tabs (history, settings, etc.) to avoid shifting the tab order.

---

## Phase 6 — Configure deep linking

### 6a. Verify your app scheme

Open `app.json` and confirm `scheme` is set:

```json
{
  "expo": {
    "scheme": "xbp"
  }
}
```

If it's set to something other than `xbp`, open `utils/mirror.ts` and update:

```typescript
const APP_SCHEME = 'your-actual-scheme';
```

### 6b. iOS — no changes needed

Expo Router handles `xbp://observe/TOKEN` automatically via the scheme above.

### 6c. Android — Intent Filter

Expo Router also handles this automatically in managed workflow. No changes needed.

### 6d. Test the deep link

In a terminal, with your dev build running:

```bash
# iOS simulator
xcrun simctl openurl booted "xbp://observe/testtoken?k=abc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1&n=Mom"

# Android emulator
adb shell am start -W -a android.intent.action.VIEW -d "xbp://observe/testtoken?k=abc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1&n=Mom" com.your.app.bundle
```

You should be redirected to the Mirrors tab immediately.

---

## Phase 7 — Wire up auto-publish

This is the only place you need to modify an **existing** file.

Find where you save a new BP log in your app. This is typically in your home screen
or a form component, inside a mutation handler. It might look like:

```typescript
const handleSave = async (data: BPFormData) => {
  await saveBPLog(data);  // your existing save logic
};
```

Add `publishNow()` immediately after the save:

```typescript
// At the top of the file, add:
import { useMirrorPublish } from '@/hooks/useMirrorPublish';

// Inside your component:
const { publishNow } = useMirrorPublish();

const handleSave = async (data: BPFormData) => {
  await saveBPLog(data);          // your existing save logic
  void publishNow();              // mirror sync — fire and forget
};
```

`publishNow()` is a no-op if the user hasn't set up a publisher config, so it's
safe to add unconditionally. The `void` prefix means errors are swallowed silently
(they're already logged internally). If you want to surface errors, `await` it instead.

---

## Phase 8 — TypeScript validation

Run the TypeScript compiler to catch any remaining import or type mismatches:

```bash
npx tsc --noEmit
```

Common errors and fixes:

| Error | Fix |
|---|---|
| `Cannot find module '@/types/mirror'` | Confirm `types/mirror.ts` was copied correctly |
| `BPLog` type mismatch | Align the type in `types/mirror.ts` with your actual `BPLog` |
| `useBPLogs` destructuring error | Update the destructuring in `useMirrorPublish.ts` |
| `Button` prop error | Add missing props to your Button component |
| `BPDisplay` readonly prop error | Remove `readonly` prop from `ObserverView.tsx` |

Fix all errors before moving on. Zero TypeScript errors is the bar.

---

## Phase 9 — Smoke test checklist

Test on a real device or simulator before shipping. Run through these flows:

### Sender side (Mom's phone)
- [ ] Open Mirrors tab → FAB visible
- [ ] Tap FAB → MirrorSetupSheet slides up
- [ ] Enter display name → tap "Create link" → link generated
- [ ] Tap "Share link" → system share sheet opens
- [ ] Log a new BP reading → no errors in Metro logs
- [ ] Return to Mirrors tab → green banner shows "Sharing as [name]"
- [ ] Tap banner → sheet shows "Share link again" + "End connection"
- [ ] Tap "End connection" → banner disappears

### Observer side (your phone)
- [ ] Open the link from sender → redirected to Mirrors tab
- [ ] Observer card appears with sender's name
- [ ] Status shows "Waiting" initially, then "Live" after first sync
- [ ] Card shows latest BP reading
- [ ] Pull to refresh in detail view → syncs
- [ ] Long press card → "Remove" alert appears
- [ ] After sender revokes → card shows "Revoked" banner

### Edge cases
- [ ] Open the same link twice → only one card created (deduplication works)
- [ ] No network → card shows cached data, status updates correctly
- [ ] Invalid link (`xbp://observe/bad`) → redirected to home, no crash

---

## Phase 10 — EAS Secrets (for production builds)

Never commit your Supabase keys to source control. For EAS builds:

```bash
# Set EAS secrets
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
```

Then reference them in `app.config.ts`:

```typescript
export default {
  expo: {
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
```

---

## Supabase maintenance notes

### Cleanup

Expired and revoked rows accumulate over time. Run this monthly in the SQL Editor,
or set up a pg_cron job in Supabase (Dashboard → Database → Extensions → enable pg_cron):

```sql
-- Manual cleanup
DELETE FROM public.xbp_mirror_blobs
WHERE (revoked = TRUE OR (expires_at IS NOT NULL AND expires_at < NOW()))
  AND updated_at < NOW() - INTERVAL '30 days';

-- pg_cron setup (run once)
SELECT cron.schedule(
  'xbp-cleanup',
  '0 3 * * 0',  -- every Sunday at 3am UTC
  $$
    DELETE FROM public.xbp_mirror_blobs
    WHERE (revoked = TRUE OR (expires_at IS NOT NULL AND expires_at < NOW()))
      AND updated_at < NOW() - INTERVAL '30 days';
  $$
);
```

### Monitoring

Free tier Supabase includes basic usage stats. For an app of this scale (a few family members),
you will never come close to the free tier limits. A single encrypted blob is ~2–5 KB.

---

## Architecture recap

```
Mom's phone                          Supabase (relay)             Observer's phone
────────────                         ────────────────             ────────────────
BPLog saved
  ↓
useMirrorPublish
  ↓ encrypt(payload, encKey)
  ↓ upsert(token, pubToken, blob)  ──────────────────────►  xbp_mirror_blobs row
                                                                     │
                                                         useMirrorSync polls every 30s
                                                                     │
                                                         decrypt(blob, encKey)
                                                                     │
                                                         ObserverCard / ObserverView
                                                           (read-only, local cache)

Mom revokes:
  ↓ update(revoked = true)         ──────────────────────►  row.revoked = true
                                                         Observer's next poll
                                                           → status = 'revoked'
                                                           → card goes dark
```

The encryption key never touches Supabase. It travels only in the share link,
from Mom's `expo-secure-store` to the observer's `expo-secure-store`.
