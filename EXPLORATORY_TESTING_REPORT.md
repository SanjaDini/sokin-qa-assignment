# Exploratory Testing Report — automationexercise.com

**Tester:** Sanja Dinić  
**Date:** September 2026  
**Session duration:** ~60 minutes  
**Environment:** Chrome (Desktop), macOS

---

## Charter

> **Explore** the core user journeys — registration, login, product browsing, cart, and checkout — with a focus on **data integrity, boundary conditions, and error handling**, to identify quality risks that automated tests may miss.

---

## Session Notes

I approached the session as a new user discovering the application for the first time, following typical e-commerce mental models, then deliberately probing edge cases.

### Area 1: Registration & Login

- Registration form accepts any string as a mobile number, including alphabetic characters. No client-side or apparent server-side format validation. A user could submit `abc` as their mobile number and the account is created successfully.
- The DOB fields (day/month/year) are free-form dropdowns that allow logically impossible dates — e.g. 31 February — without error.
- After successful registration, the "Account Created!" page has a **Continue** button that redirects to the home page. If the user presses the browser **Back** button instead, they land on the blank account form again (no server-side session guard).
- Login form fields have no visible password strength indicator or minimum length enforcement at the UI level (the API accepts single-character passwords).
- **There is no "forgot password" / reset flow.** A user who forgets their password has no recovery path. This would be a P1 gap in a production system.

### Area 2: Product Browsing & Search

- The search bar on the Products page returns results as soon as the search button is clicked — no debounce issue. However, typing into the search field and pressing **Enter** does *not* trigger a search; only clicking the button works. This is unexpected keyboard behaviour and an accessibility concern.
- Searching with a single space returns all products — functionally equivalent to an empty search. This may expose more products than intended to scrapers.
- Product detail pages expose the product `id` in the URL (`/product_details/1`). Incrementing the ID manually navigates to other products without any guard — this is expected for a public catalogue but worth noting.
- Product prices are displayed as strings (e.g. "Rs. 500") with a currency symbol baked in. If the site ever internationalises, this would be a significant data migration risk.

### Area 3: Cart Behaviour

- Adding the same product to the cart twice via the "Add to cart" button increases the quantity counter, as expected.
- However, if a user opens the same product's detail page and clicks "Add to Cart" there, a **second line item** is added rather than incrementing the quantity. This inconsistency could confuse users and cause duplicate checkout charges in a real system.
- The cart page displays correctly when empty — it shows a "Cart is empty!" message without error.
- Removing an item from the cart (X button) works correctly and the total updates.
- Cart state **persists in the browser session** but is **not tied to an account**. If a guest adds items and then logs in, the cart items are **lost**. This is a significant UX issue in most e-commerce platforms; users expect cart continuity across login.

### Area 4: Checkout & Payment

- The checkout page shows delivery and billing addresses in a table. The addresses are identical (same address used for both), with no option to specify a different billing address. Not necessarily a bug, but a limitation.
- The payment form accepts any string in the card number field — including letters. There is no client-side Luhn check. A user who types `aaaaaaaaaaaaaaaa` as a card number will get an error, but only after form submission, not inline.
- The expiry month field is a free-text input. Entering `99` as a month is accepted without client-side validation.
- After a successful order, the confirmation page shows an "Order Placed!" heading but **no order ID or order confirmation number**. Users cannot reference their order for support purposes.
- Navigating back from the confirmation page via the browser button allows placing the order again with the same payment details (no idempotency guard at the UI level).

### Area 5: General / Cross-cutting

- The site injects **Google Ads iframes** throughout the page. On slower connections these can overlap interactive elements and delay or prevent test automation clicks. In manual testing I observed an ad overlay blocking the "Add to cart" button on two occasions.
- HTTP is available (no redirect to HTTPS forced at all entry points) — e.g. `http://automationexercise.com` loads without redirection. In a real application, all traffic should be forced to HTTPS.
- The API returns HTTP 200 for all responses, including errors. The actual status is embedded in the `responseCode` field of the JSON body. This is a non-standard pattern that makes API-level monitoring and alerting harder (a 400 looks like a 200 in server logs).

---

## Documented Findings

### Finding 1 — Cart abandonment on login (P1 — High severity)

**Observation:** A guest user who adds items to the cart and then logs in loses all cart items. The cart is not merged with any server-side cart for the authenticated session.

**Risk:** This is one of the highest-impact UX bugs in e-commerce. Research consistently shows cart abandonment rates spike when users are required to log in. Losing items they deliberately selected removes the entire incentive to complete the purchase.

**Severity:** High  
**Priority:** P1 — would block a production launch

**Reproduction:**
1. Browse products as a guest and add 2 items to the cart.
2. Click "Checkout" and choose "Register / Login".
3. Log in with valid credentials.
4. Navigate to the cart — it is empty.

---

### Finding 2 — Order placed without order reference number (P2 — Medium severity)

**Observation:** After completing the checkout and payment, the confirmation page shows "Congratulations! Your order has been confirmed!" but does **not** display an order ID, reference number, or confirmation email trigger.

**Risk:** Without an order reference, customers cannot follow up with support, track a shipment, or verify their order. In a real payment system, this would also prevent dispute resolution.

**Severity:** Medium  
**Priority:** P2 — significant gap in user experience and support workflow

**Reproduction:**
1. Complete the full checkout flow (login → add product → checkout → pay).
2. Observe the order confirmation page — no order number is displayed.

---

### Finding 3 — No HTTPS redirect (P2 — Security)

**Observation:** Navigating to `http://automationexercise.com` loads the site over plain HTTP without any redirect to HTTPS.

**Risk:** In a production application handling authentication and payment data, this would expose credentials and card details to network interception (MITM attacks). For a demo site this is acceptable, but it would be a P0 security issue in production.

**Severity:** Medium (demo only — P0 in production)  
**Priority:** P2

---

### Finding 4 — Duplicate cart line items vs. quantity increment inconsistency (P2)

**Observation:** Adding a product to the cart from the catalogue page increments the quantity of an existing line item. Adding the same product from its detail page creates a duplicate line item instead.

**Risk:** Users see confusing cart contents. In a real payment flow this could result in being charged twice for the same item if checkout processes line items independently.

**Severity:** Medium  
**Priority:** P2

---

### Finding 5 — No server-side validation on mobile number format (P3 — Low)

**Observation:** The registration form accepts any string (including letters) in the mobile_number field. API endpoint also accepts non-numeric values without error.

**Risk:** Garbage data in the user database. If the system ever sends SMS notifications or validates mobile numbers for 2FA, it would fail silently for a large portion of users.

**Severity:** Low (no immediate user impact)  
**Priority:** P3

---

## Summary

| ID | Finding | Severity | Priority |
|----|---------|----------|----------|
| 1 | Cart lost on login | High | P1 |
| 2 | No order reference number | Medium | P2 |
| 3 | No HTTPS redirect | Medium (P0 in prod) | P2 |
| 4 | Duplicate line items inconsistency | Medium | P2 |
| 5 | No mobile number format validation | Low | P3 |

The most impactful finding by far is **Finding 1** — cart abandonment on login. In a real product this would be the first defect on my backlog. The remaining findings are real quality concerns but individually lower in urgency.
