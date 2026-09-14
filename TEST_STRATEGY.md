# Test Strategy — automationexercise.com

## 1. Objective

This document describes my approach to testing the `automationexercise.com` demo e-commerce application as part of the Sokin QA Analyst assignment. The goal is to demonstrate considered prioritisation, clear API-vs-E2E decision-making, and honest communication of constraints rather than maximising test count.

---

## 2. System Under Test

- **Application:** https://automationexercise.com — a demo e-commerce site with product browsing, user accounts, and a checkout flow.
- **API:** 14 documented REST-style endpoints covering products, brands, search, authentication, and user CRUD.
- The site is a **public demo** — shared state, unreliable uptime, and no staging environment are expected constraints.

---

## 3. Testing Approach

### 3.1 Risk-based prioritisation

I assessed business risk first, then decided which layer to test at. The primary question is: *if this breaks, what is the user/business impact?*

| Risk area | Impact | Approach |
|-----------|--------|----------|
| User registration / login | High — blocks all authenticated actions | API + E2E |
| Checkout & payment | Critical — direct revenue impact | E2E (happy path + guest guard) |
| Add to cart | High — core purchasing flow | E2E |
| Product search | Medium — discoverability | API + E2E |
| Product & brand catalogue | Low-medium — read-only display | API schema only |
| User CRUD (API) | Medium — data integrity | API |
| Unsupported HTTP methods | Low — defensive regression | API (quick) |

### 3.2 Test pyramid rationale

```
        /‾‾‾\
       / E2E \         ~15 tests   Critical journeys only
      /‾‾‾‾‾‾‾\
     /  API    \       ~25 tests   All endpoints, positive + negative
    /‾‾‾‾‾‾‾‾‾‾‾\
   / Unit/contract \   (not in scope for this timebox)
```

The majority of coverage sits at the API layer because:
- API tests are 10–20× faster than E2E
- They test business logic with surgical precision
- Failures are easier to diagnose
- The demo site's browser-layer has ad overlays and flakiness that make every unnecessary E2E test a maintenance burden

E2E tests are reserved for journeys that **can only be validated in a browser** (visual flow, navigation state, payment UI) or where the API alone does not give confidence (e.g. cart persistence across page navigation).

---

## 4. What I Prioritised

1. **Authentication** — Login and registration gate everything. Covered at both API and E2E.
2. **Full checkout journey** — The single most critical user flow. One happy-path E2E test covers the end-to-end scenario.
3. **User CRUD** — The API supports full lifecycle (create, read, update, delete); I test all four operations with cleanup after each test.
4. **Search** — Covered at API (parametric for multiple terms) and E2E (visual confirmation).
5. **Cart** — Adding items, persistence across navigation, multiple items.
6. **Negative / boundary API cases** — Missing parameters, wrong HTTP methods, duplicate email, invalid credentials.

---

## 5. API Tests vs E2E Decision Framework

| Scenario | Layer | Reason |
|----------|-------|--------|
| Product list schema validation | API | No browser interaction needed; fast and precise |
| Brand list schema validation | API | Same |
| Search returns relevant results | API + E2E | API validates data; E2E validates UI rendering |
| Login with valid/invalid credentials | API + E2E | API validates server response; E2E validates redirect/UI state |
| User CRUD lifecycle | API only | Purely data layer; no UI to validate |
| Full checkout | E2E only | Multi-page navigation, address rendering, payment form |
| Cart persistence across navigation | E2E only | Browser session state — not testable via API |
| Guest checkout guard | E2E only | Modal/redirect behaviour is UI-only |

---

## 6. Test Tags

Tests are tagged with `@smoke` and `@regression` to enable selective execution:

- `@smoke` — Fast, critical-path tests. Run on every PR. ~10 tests, target < 3 minutes.
- `@regression` — Full suite. Run on merge to main/develop. ~40 tests, target < 15 minutes.

---

## 7. Key Risks and Assumptions

### Risks

- **Shared demo environment** — Other users may create/delete accounts between tests. Mitigated by using timestamp-based unique email addresses for each test run.
- **Ad overlays** — The site serves Google Ads iframes that can intercept clicks. The `BasePage.dismissAdOverlay()` helper handles this, but some E2E tests may still be fragile.
- **Rate limiting** — The demo server may throttle parallel API requests. CI workers are capped at 4, with a `retry: 2` policy.
- **Payment flow** — The demo site's payment step uses a simulated gateway. The test uses a known-good Visa test card (`4111 1111 1111 1111`); this may behave differently in future.
- **EXISTING_USER account** — E2E login tests depend on a pre-seeded account. If this account is deleted or its password changed externally, those tests will fail. Mitigation: use a dedicated `@mailnull.com` address not publicly advertised.

### Assumptions

- The API always returns HTTP 200 (transport-level), with the actual status code in the `responseCode` field of the JSON body. This is confirmed by the API documentation.
- The demo site is intended for public automation practice and test data written during runs is acceptable.
- No SLAs or performance requirements are defined; I have not included performance or load tests.

---

## 8. Intentionally Not Tested

| Area | Reason |
|------|--------|
| **Contact Us form** | Sends a real email; not appropriate to spam in a demo |
| **Test Cases page** | Static content; no automation value |
| **Video tutorials** | External YouTube links; outside scope |
| **Cross-browser testing** | Firefox/WebKit configs exist but are commented out. With more time I would enable them; they add signal but also noise on a shared demo site. |
| **Accessibility (a11y)** | Not in the assignment scope; would use `@axe-core/playwright` in a real project |
| **Performance / load** | Not in scope for this timebox |
| **Unit tests** | The codebase has no application logic to unit-test (test helpers are thin wrappers); unit coverage would add little value here |

---

## 9. What I Would Do With More Time

- **Seed user via API** in E2E `beforeAll` rather than relying on a hard-coded account
- **Add Firefox and mobile viewport** projects to the CI matrix
- **Integrate Axe** for a11y scanning on key pages
- **Add Allure or GitHub Summary reporter** for richer CI feedback
- **Visual regression snapshot** on the home page and product detail page
- **Contract testing** between the UI and API (e.g. verify the cart page POSTs the same product IDs the API returns)
- **Environment matrix** — run the same suite against a staging URL via `BASE_URL` env override
