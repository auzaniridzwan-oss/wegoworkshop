# Wego Workshop – Travel Booking Demo

A static travel booking **single-page application (SPA)** for demonstrating **Braze Web SDK** integrations. Users can search for flights (Southeast Asia), view results, and complete a booking flow: baggage, seats, meals, ancillaries, passenger info, review, and payment.

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

- **HTML, CSS, JavaScript** only (no build step).
- **Single HTML file** (`index.html`) with all views; no separate page files.
- **Components** – Reusable UI loaded via `data-include`:
  - `components/header.html` – Header, logo, notifications, Braze panel link
  - `components/hero-carousel.html` – Hero slides (Braze Content Cards)
  - `components/promo-feed.html` – Promo grid on home
  - `components/booking-steps.html` – Step tabs for booking
  - `components/promo-sidebar.html` – Braze Banners sidebar
- **State** – `localStorage` for search params (`wego_search_params`) and booking state (`wego_booking_state`). URL query params are merged into booking state for deep links.

---

## Design and styling

- Layout follows wireframes: header, flight summary bar, step tabs, main content, promo sidebar where applicable.
- **CSS variables** in `css/variables.css` for theming (Wego-inspired primary orange, neutrals, typography, spacing).
- Shared styles in `css/common.css` (header, footer, buttons, forms, flight summary bar, booking steps, promo sidebar).
- View-specific styles in `css/wego.css`.

---

## Data

- **Cities** – Fixed list in `js/data.js`: Singapore, Kuala Lumpur, Bangkok, Jakarta, Manila, Ho Chi Minh City, Hanoi, Yangon, Phnom Penh, Vientiane, Da Nang, Cebu (Southeast Asia).
- **Airlines** – Fixed list of real carriers (Singapore Airlines, Malaysia Airlines, Thai Airways, Garuda, Philippine Airlines, Vietnam Airlines, AirAsia group, Scoot, Jetstar Asia, Royal Brunei, etc.).
- **Flights** – Mock data generated from search params via `generateMockFlights()` (same params produce same list so selection is stable).
- **Booking code** – Random 8-character code per completed booking via `generateBookingCode()`.
- **Final booking** – Stored in `localStorage` (`wego_booking_state`) and used for Braze events or payloads.

---

## File layout

```
app/
├── index.html              # Single entry point – all views
├── css/
│   ├── variables.css       # Theme variables
│   ├── common.css          # Shared styles
│   └── wego.css            # App-specific styles
├── components/             # HTML fragments loaded via data-include
│   ├── header.html
│   ├── hero-carousel.html
│   ├── promo-feed.html
│   ├── booking-steps.html
│   └── promo-sidebar.html
├── js/
│   ├── app.js              # SPA: view switching, booking steps, init
│   ├── booking-state.js    # getBookingState, setBookingState, resetBookingState
│   ├── querystring.js      # getSearchParams, setSearchParams (localStorage)
│   ├── data.js             # Cities, airlines, mock flights, options
│   ├── braze2.js           # Braze SDK wrapper
│   ├── auth-demo.js        # Demo login
│   └── components/
│       ├── include.js      # data-include loader (fetch + inject)
│       ├── hero-carousel.js
│       ├── promo-feed.js
│       ├── promo-sidebar.js
│       ├── booking-steps.js
│       ├── notifications.js
│       ├── login-overlay.js
│       ├── account-overlay.js
│       └── braze-panel.js
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
