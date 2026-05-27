# frontend_credential_test

Next.js app for the **Credential Cloud** assignment (UI + API integration).

Production reference (do not edit unless told): `frontend/`

---

## What this repo is

- Credential Cloud only: `/credentials-cloud/credentials` and related screens/modals.
- **No login** — app opens on the credentials dashboard with a mock user (**Test User**).
- **Mock mode** works without a running backend.
- **API mode** connects to `backend_credential_test` (or your hosted Go API).

**Out of scope in this folder:** Experience Hub, Mission Room, onboarding, login.

---

## Quick start

### Prerequisites

- Node.js 20+
- npm

### Run (mock — default)

```bash
npm install
npm run dev
```

Open **http://localhost:3000/app** (`basePath` is `/app`).

`.env.local` should contain:

```env
APP_DATA_MODE=mock
NEXT_PUBLIC_APP_DATA_MODE=mock
```

### Run with backend (full stack)

1. Start **backend_credential_test** (see its README).
2. Update `.env.local`:

```env
APP_DATA_MODE=api
NEXT_PUBLIC_APP_DATA_MODE=api
AUTH_API_BASE_URL=http://localhost:8080
AUTH_SECRET=dev-assignment-secret-change-me
```

3. Restart `npm run dev`.

The UI calls Next.js routes under `app/api/`, which proxy to the Go API when in API mode.

---

## Assignment requirements (summary)

### 1. UI / Figma

- Match Figma **100%** for spacing, typography, colors, icons, sizing, interactions, layout.
- **Responsive:** desktop, tablet, mobile (list, filters, modals, empty states).

### 2. States

Implement all design states:

| State | Where |
|-------|--------|
| Empty (no credentials) | `credentials/page.tsx` |
| Skeleton loading | `CredentialSkeletonCard`, `ContentPageSkeleton` |
| Filter empty | Same page |
| Success / error | `CredentialSuccessDialog`, `AppToast` |

### 3. Credential flows

| Requirement | Detail |
|-------------|--------|
| Full journey | Empty user → add credential → appears in list → view/manage |
| **Metaverse add** | **Disabled** — cannot bypass |
| **Other credentials** | Others → Add Other Awards — full Figma flow |
| Metaverse cards in list | Logo + blue tick = existing Metaverse; keep separate from Other |

### 4. Privacy and sharing

| Mode | Expected behavior |
|------|-------------------|
| **Public** | User can share; viewer can open link without login |
| **Private** | No public share; shared URL must not expose credential |

**Important:** visibility must **persist** (API + UI), not only local React state on the card.

Key files:

- `components/CredentialCard.tsx` — visibility control on card
- `components/CredentialDetailDialog.tsx` — edit visibility, share link
- `components/OtherCredentialModal.tsx` — visibility on create
- `app/credentials-cloud/credentials/[id]/page.tsx` — shared link viewer
- `modules/credentials/presentation/credential-detail-screen.tsx`

### 5. Add Credential icon

Replace wrong icon (e.g. book) with **plus (+)** from Lucide (`Plus`) on Add Credential buttons (header + empty state).

### 6. Navigation

Add Credential → **Others** → complete modal steps per Figma → success → credential in list.

---

## Project structure (main files)

```text
app/
  credentials-cloud/
    credentials/page.tsx          # Main screen
    credentials/[id]/page.tsx     # Detail + ?shared= public view
  api/
    credentials/route.ts          # List / create (BFF)
    credentials/[id]/route.ts     # Get / update / delete
    events/route.ts               # Event picker (Other credential)
hooks/
  useCredentials.ts               # List state, filters, modals
components/
  CredentialCard.tsx
  CredentialFilterPanel.tsx
  OtherCredentialModal.tsx
  MedalverseModal.tsx             # Disable create entry only
  CredentialDetailDialog.tsx
  CredentialCloudFrame.tsx
  CredentialCloudSubmenu.tsx
modules/
  credentials/                    # Types, mock data, detail screens
  experience/                     # claim-dialog, types (Medalverse modal)
shared/
  auth/server-session.ts          # Mock session (no login)
```

---

## Scripts

```bash
npm run dev      # Development
npm run build    # Production build (verify before submit)
npm run start    # Run production build locally
npm run lint     # ESLint
```

---

## Deploy (Vercel)

Candidates set up hosting themselves. **No `vercel.json` or deploy scripts** in this repo.

Suggested Vercel environment variables (API mode):

| Variable | Example |
|----------|---------|
| `APP_DATA_MODE` | `api` |
| `NEXT_PUBLIC_APP_DATA_MODE` | `api` |
| `AUTH_API_BASE_URL` | `https://your-api.example.com` |
| `AUTH_SECRET` | Same as backend `JWT_SECRET` if required |

Root directory for Vercel: **`frontend_credential_test`**

---

## QA checklist (before submit)

- [ ] Figma match (desktop; spot-check tablet/mobile)
- [ ] Empty, skeleton, success, error states
- [ ] Add Other flow end-to-end (mock and/or API)
- [ ] Metaverse add disabled; no bypass
- [ ] Public share works; private link blocked
- [ ] Plus icon on Add Credential
- [ ] `npm run build` passes
- [ ] No secrets in git (`.env.local` not committed)

---

## Pair with backend

| Repo | Role |
|------|------|
| **backend_credential_test** | Go API — credentials, `is_private`, events |
| **frontend_credential_test** | This app |

See `backend_credential_test/README.md` for API setup.
