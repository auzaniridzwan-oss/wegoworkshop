# Wego Workshop – Travel Booking Demo

A static travel booking **single-page application (SPA)** for demonstrating **Braze Web SDK** integrations. Users can search for flights (Southeast Asia), view results, and complete a booking flow: baggage, seats, meals, ancillaries, passenger info, review, and payment. Demo users are selectable at login and their Braze profiles are fetched live from the Braze REST API.

---

## Single-page application structure

The app is a **client-side SPA** with one HTML entry point. All views live in `index.html`; JavaScript switches between them without full page reloads.

### Entry point

- **`index.html`** – Single entry point. Contains all views, loads components via `data-include`, and initializes the app.

### Views (app screens)

| View ID | Purpose |
|---------|---------|
| `view-home` | Homepage: hero carousel, flight search form, promo feed |
| `view-results` | Flight results with filters (airline, depart/arrival) and sort (price, duration) |
| `view-booking` | Booking funnel with 7 steps (see below) |
| `view-complete` | Confirmation: booking code, add to calendar, download app, subscribe |

Views are shown/hidden via the `.app-view` and `.active` classes. Only one view is active at a time.

### Booking flow (7 steps)

The booking view (`view-booking`) contains step content panels. Steps are shown one at a time via `.step-content` and `.active`:

1. **Baggage** – Choose baggage allowance and cancellation policy
2. **Seats** – Seat map selection
3. **Meals** – Meal preference (normal, vegetarian, gluten-free, kosher/halal)
4. **Others** – Add-ons (travel insurance, lounge, wifi, priority boarding)
5. **Passenger** – Lead passenger contact and passport details
6. **Review** – Summary with “Change” links back to any step
7. **Payment** – Card form; submit triggers processing overlay, then completion

Step navigation is handled by `js/app.js` (`showBookingStep()`). The booking steps component (`components/booking-steps.html`) shows the step tabs and highlights the current step.

---

## Technical structure

- **HTML, CSS, JavaScript** only (no build step required to run the app).
- **Tailwind CSS** and **Flowbite** loaded from CDN — no local compilation needed.
- **Single HTML file** (`index.html`) with all views; no separate page files.
- **Components** – Reusable UI loaded via `data-include`:
  - `components/header.html` – Header, logo, notifications, Braze panel link
  - `components/hero-carousel.html` – Hero slides (Braze Content Cards)
  - `components/promo-feed.html` – Promo grid on home
  - `components/booking-steps.html` – Step tabs for booking
  - `components/promo-sidebar.html` – Braze Banners sidebar
- **State** – All `localStorage` access is routed through `js/core/StorageManager.js`. Keys are automatically namespaced under the `wego_` prefix. URL query params are merged into booking state for deep links.
- **Logging** – All application logging is routed through `js/core/AppLogger.js` (see below).

---

## Design and styling

- Layout follows wireframes: header, flight summary bar, step tabs, main content, promo sidebar where applicable.
- **Tailwind CSS** loaded via CDN (`https://cdn.tailwindcss.com`) with a custom theme config for Wego-inspired colours (primary orange, neutrals, typography, spacing).
- **Flowbite v3.1.2** loaded via CDN for pre-built UI components (dropdowns, modals, carousels, tabs, etc.).
- **`css/custom.css`** – Minimal utility overrides for SPA view toggling (`.app-view`, `.step-content` active states) and app-specific helpers not covered by Tailwind/Flowbite.

---

## Data

- **Cities** – Fixed list in `js/data.js`: Singapore, Kuala Lumpur, Bangkok, Jakarta, Manila, Ho Chi Minh City, Hanoi, Yangon, Phnom Penh, Vientiane, Da Nang, Cebu (Southeast Asia).
- **Airlines** – Fixed list of real carriers (Singapore Airlines, Malaysia Airlines, Thai Airways, Garuda, Philippine Airlines, Vietnam Airlines, AirAsia group, Scoot, Jetstar Asia, Royal Brunei, etc.).
- **Flights** – Mock data generated from search params via `generateMockFlights()` (same params produce same list so selection is stable).
- **Booking code** – Random 8-character code per completed booking via `generateBookingCode()`.
- **Final booking** – Stored via `StorageManager` (key: `booking_state`) and used for Braze events or payloads.

---

## File layout

```
app/
├── index.html              # Single entry point – all views
├── vercel.json             # Vercel deployment: API routes + SPA fallback
├── package.json            # Node dependencies (ky, Playwright)
├── api/
│   └── braze-user.js       # Serverless function: GET /api/braze-user?external_id=<id>
├── css/
│   └── custom.css          # SPA view/step toggle overrides & app-specific helpers
├── components/             # HTML fragments loaded via data-include
│   ├── header.html
│   ├── hero-carousel.html
│   ├── promo-feed.html
│   ├── booking-steps.html
│   └── promo-sidebar.html
├── js/
│   ├── core/
│   │   ├── StorageManager.js # Centralised singleton for all localStorage I/O (wego_ prefix)
│   │   └── AppLogger.js      # Centralised singleton logger (INFO/DEBUG/WARN/ERROR)
│   ├── app.js              # SPA: view switching, booking steps, init
│   ├── booking-state.js    # getBookingState, setBookingState, resetBookingState
│   ├── querystring.js      # getSearchParams, setSearchParams (localStorage)
│   ├── data.js             # Cities, airlines, mock flights, options
│   ├── braze2.js           # Braze SDK wrapper
│   ├── auth-demo.js        # Demo user list, Braze profile fetch, login/logout
│   └── components/
│       ├── include.js      # data-include loader (fetch + inject)
│       ├── hero-carousel.js
│       ├── promo-feed.js
│       ├── promo-sidebar.js
│       ├── booking-steps.js
│       ├── notifications.js
│       ├── login-overlay.js  # Dynamic demo user selection UI
│       ├── account-overlay.js
│       └── braze-panel.js    # Dynamic attributes rendering
├── _deprecated_pages/      # Legacy multi-page HTML (no longer used)
└── README.md
```

---

## Running locally

Open `index.html` in a browser. For Braze Web SDK and component includes (`fetch()`), a local HTTP server is recommended:

```bash
npx serve .
```

Or use your IDE’s live server. The `data-include` loader requires HTTP/HTTPS for `fetch()` to work.

### Installing dependencies

```bash
npm install
```

This installs `ky` (used by the `api/braze-user.js` serverless function) and `Playwright` (for testing). Tailwind CSS and Flowbite are loaded from CDN and require no local installation to run the front-end.

### Environment variables (for the Braze API proxy)

The `api/braze-user.js` serverless function requires two environment variables set on your Vercel project (or locally in a `.env` file when using `vercel dev`):

| Variable | Description |
|----------|-------------|
| `BRAZE_API_KEY` | REST API key with `/users/export/ids` permission |
| `BRAZE_REST_ENDPOINT` | Your Braze REST endpoint (e.g. `https://rest.iad-05.braze.com`) |

### Deploying to Vercel

```bash
vercel deploy
```

`vercel.json` routes `/api/*` requests to the serverless functions and all other paths to `index.html` as a SPA fallback.

---

## Demo users

When a user clicks **Login**, the overlay displays a list of selectable demo users. Each entry maps to a Braze `external_id`. Clicking **Login** on a row:

1. Calls `window.Braze2.changeUser(externalId)` to switch the Braze SDK identity.
2. Fetches the user's profile from Braze via `GET /api/braze-user?external_id=<id>`.
3. Normalises the response into the app user shape (name, email, phone, `customAttributes`).
4. Persists the profile to `StorageManager` and updates the Braze debug panel.

### Configuring demo users

Edit the `DEMO_USERS` array at the top of `js/auth-demo.js`:

```js
var DEMO_USERS = [
  { externalId: 'wego9999', label: 'User 1 (wego9999)' },
  { externalId: 'wego1001', label: 'User 2 (wego1001)' },
  { externalId: 'wego1002', label: 'User 3 (wego1002)' },
  { externalId: 'wego1003', label: 'User 4 (wego1003)' }
];
```

Add, remove, or rename entries as needed. The login overlay rebuilds itself from this list each time it opens.

### Braze profile API (`api/braze-user.js`)

A lightweight Vercel serverless function that proxies the Braze `/users/export/ids` endpoint so that the API key stays server-side.

- **Route**: `GET /api/braze-user?external_id=<id>`
- **Response**: `{ externalId, firstName, lastName, name, email, phone, customAttributes }`
- **Errors**: `400` missing param · `404` user not found · `500` env vars missing or Braze error
- **Dependency**: [`ky`](https://github.com/sindresorhus/ky) for the outbound HTTP request

The Braze panel attributes section is now **fully dynamic** — it renders whatever `customAttributes` the API returns, with no hardcoded field names.

---

## Storage (StorageManager)

All `localStorage` access is centralised in `js/core/StorageManager.js` — a singleton exposed as `window.StorageManager`. Direct `localStorage.*` calls have been removed from all modules.

| Method | Signature | Description |
|--------|-----------|-------------|
| `set` | `StorageManager.set(key, value)` | Persists any JSON-serialisable value under `wego_<key>` |
| `get` | `StorageManager.get(key, defaultValue?)` | Reads a value; returns `defaultValue` if absent or unparseable |
| `remove` | `StorageManager.remove(key)` | Deletes a single key |
| `clearSession` | `StorageManager.clearSession()` | Removes only app-owned keys (`wego_*`); leaves Braze SDK keys untouched |

**Storage keys used by the app** (all stored under the `wego_` prefix):

| Key | Owner | Purpose |
|-----|-------|---------|
| `search_params` | `querystring.js` | Last flight search parameters |
| `booking_state` | `booking-state.js` | Active booking step data |
| `logged_in` | `auth-demo.js` | Demo login flag |
| `demo_user` | `auth-demo.js` | Demo user profile |
| `anon_user` | `auth-demo.js` | Anonymous user / device ID |
| `hero_carousel` | `hero-carousel.js` | Cached Content Card slides |
| `notifications` | `notifications.js` | Notification list state |
| `braze_profile` | `braze-panel.js` | Braze debug panel profile |
| `braze_attributes` | `braze-panel.js` | Braze debug panel attributes |
| `braze_events` | `braze-panel.js` | Braze debug panel event log |

---

## Logging (AppLogger)

All application logging is centralised in `js/core/AppLogger.js` — a singleton exposed as `window.AppLogger`. Raw `console.*` calls have been replaced throughout the codebase.

| Level | Method | When to use |
|-------|--------|-------------|
| INFO | `AppLogger.info(category, msg, data?)` | Normal flow milestones |
| DEBUG | `AppLogger.debug(category, msg, data?)` | Verbose / diagnostic output |
| WARN | `AppLogger.warn(category, msg, data?)` | Recoverable errors |
| ERROR | `AppLogger.error(category, msg, data?)` | Unrecoverable failures |

**Categories**: `[UI]`, `[SDK]`, `[AUTH]`, `[STORAGE]`, `[SYSTEM]`, `[API]`

**Behaviour**:
- On `localhost` / `127.0.0.1` all levels are printed to the browser console (debug mode).
- In production only `WARN` and `ERROR` are printed; all levels are silently buffered.
- Up to 100 log entries are kept in memory and accessible via `AppLogger.getLogs(n)`.
- Each log entry fires a `app:log` custom DOM event for the developer debug overlay to consume.

---

## Braze integration

- **Events** – Custom events at key steps: `searched-flight` (home search submit), `booked-flight` (payment submit).
- **User properties** – Set from search/booking (e.g. last search route, class, booking code).
- **Content Cards** – Hero carousel driven by Braze Content Cards (`message_type === 'hero_carousel'`).
- **Banners** – Promo sidebar driven by Braze Banners (container id `ux_promo_sidebar`).
- **In-app messages** – Shown automatically via SDK when triggered.
- **Braze panel** – Debug overlay (header link) for user profile, attributes, events.

---

## Application flow

```
Home (search) → Results (select flight) → Booking (7 steps) → Complete
                     ↑                          |
                     |__________________________|  (Cancel from payment)
```
