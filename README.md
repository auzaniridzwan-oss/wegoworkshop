# Wego Workshop – Travel Booking Demo

A static travel booking website for demonstrating **Braze Web SDK** integrations. Users can search for flights (Southeast Asia), view results, and complete a booking flow: baggage, seats, meals, ancillaries, and payment.

## Technical structure

- **HTML, CSS, JavaScript** only (no build step).
- **Separate HTML files** per page:
  - `home.html` – Homepage with hero, flight search, promo blocks
  - `search_results.html` – Flight results with filters and sort
  - `booking-baggage.html` – Step 1: Baggage and cancellations
  - `booking-seats.html` – Step 2: Seat selection
  - `booking-meals.html` – Step 3: Meal selection
  - `booking-ancillaries.html` – Step 4: Others (travel insurance, lounge, wifi, priority)
  - `booking-review.html` – Step 5: Review (summary of all choices; proceed to payment or go back to change)
  - `booking-payment.html` – Step 6: Payment form
  - `booking-complete.html` – Confirmation and booking code
- **Querystrings** carry state between pages (from, to, dates, class, passengers, flightIndex, baggage, seats, meal, ancillaries, bookingCode).

## Design and styling

- Layout follows the provided wireframes (header, flight summary, step tabs, main content, promo sidebar where applicable).
- **CSS variables** in `css/variables.css` for theming (Wego-inspired primary orange, neutrals, typography, spacing).
- Shared styles in `css/common.css` (header, footer, buttons, forms, flight summary bar, booking steps, promo sidebar).

## Data

- **Cities** – Fixed list in `js/data.js`: Singapore, Kuala Lumpur, Bangkok, Jakarta, Manila, Ho Chi Minh City, Hanoi, Yangon, Phnom Penh, Vientiane, Da Nang, Cebu (Southeast Asia).
- **Airlines** – Fixed list of real carriers (Singapore Airlines, Malaysia Airlines, Thai Airways, Garuda, Philippine Airlines, Vietnam Airlines, AirAsia group, Scoot, Jetstar Asia, Royal Brunei, etc.).
- **Flights** – Mock data generated from search params via `generateMockFlights()` (same params produce same list so selection is stable across pages).
- **Booking code** – Random 8-character code per completed booking via `generateBookingCode()`.
- **Final booking** – Represented as a JSON object on the confirmation page: `window.__BOOKING_JSON__` (bookingCode, flight, baggage, seats, meal, ancillaries, completedAt). Use this for Braze events or payloads.

## Running locally

Open `home.html` in a browser (file protocol is fine). For Braze Web SDK you may need a local server (e.g. `npx serve .` or your IDE’s live server) if the SDK requires HTTP/HTTPS.

## Braze integration

- **Events** – Fire custom events at key steps (e.g. “Searched Flights”, “Viewed Results”, “Selected Flight”, “Completed Baggage”, “Completed Payment”, “Booking Complete”).
- **User properties** – Set from search/booking (e.g. last search route, class, booking code).
- **Booking payload** – On `booking-complete.html`, read `window.__BOOKING_JSON__` and send it to Braze (e.g. as event properties or a custom attribute) for campaigns and analytics.

## File layout

```
app/
├── home.html
├── search_results.html
├── booking-baggage.html
├── booking-seats.html
├── booking-meals.html
├── booking-ancillaries.html
├── booking-review.html
├── booking-payment.html
├── booking-complete.html
├── css/
│   ├── variables.css
│   └── common.css
├── js/
│   ├── data.js
│   └── querystring.js
└── README.md
```
# wegoworkshop
