# Sokin QA Assignment — automationexercise.com

Playwright + TypeScript test suite for the [automationexercise.com](https://automationexercise.com) demo e-commerce application.

Submitted as part of the **QA Analyst** technical assignment for Sokin.

---

## Project structure

```
sokin-qa-assignment/
├── src/
│   ├── data/
│   │   └── test-data.ts          # User factories, search terms, shared constants
│   ├── fixtures/
│   │   ├── api-fixtures.ts       # Playwright fixture: injects ApiClient
│   │   └── e2e-fixtures.ts       # Playwright fixture: injects all Page Objects
│   ├── helpers/
│   │   └── api-client.ts         # Typed wrapper around APIRequestContext
│   ├── pages/                    # Page Object Models
│   │   ├── BasePage.ts
│   │   ├── HomePage.ts
│   │   ├── LoginPage.ts
│   │   ├── SignupPage.ts
│   │   ├── ProductsPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   └── PaymentPage.ts
│   └── types/
│       └── api.types.ts          # TypeScript interfaces mirroring the API schema
├── tests/
│   ├── api/                      # API test specs
│   │   ├── products-brands.spec.ts
│   │   ├── search.spec.ts
│   │   ├── login.spec.ts
│   │   └── user-crud.spec.ts
│   └── e2e/                      # E2E browser test specs
│       ├── registration.spec.ts
│       ├── login.spec.ts
│       ├── product-search.spec.ts
│       ├── add-to-cart.spec.ts
│       └── checkout.spec.ts
├── .github/workflows/
│   └── playwright.yml            # GitHub Actions CI/CD
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── TEST_STRATEGY.md              # Written test strategy
└── EXPLORATORY_TESTING_REPORT.md # Exploratory testing findings
```

---

## Prerequisites

- **Node.js** ≥ 18 (LTS recommended — tested on v20)
- **npm** ≥ 9
- Internet access to `https://automationexercise.com`

No local server or database setup is required — the suite runs entirely against the live demo site.

---

## Installation

```bash
# 1. Clone / unzip the project
cd sokin-qa-assignment

# 2. Install npm dependencies
npm install

# 3. Install Playwright browsers (Chromium only is needed by default)
npx playwright install chromium --with-deps
```

---

## Running the tests

### All tests (API + E2E)

```bash
npm test
```

### API tests only

```bash
npm run test:api
```

### E2E tests only

```bash
npm run test:e2e
```

### Smoke tests only

```bash
npm run test:smoke
```

### Regression tests

```bash
npm run test:regression
```

### Headed mode (watch the browser)

```bash
npm run test:headed
```

### View the HTML report after a run

```bash
npm run report
```

---

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `BASE_URL` | `https://automationexercise.com` | Base URL for E2E browser tests |
| `API_BASE_URL` | `https://automationexercise.com` | Base URL for API requests |
| `CI` | _(unset)_ | Set to `true` in CI; enables stricter retries and forbids `.only` |

Example — run against a different environment:

```bash
BASE_URL=https://staging.example.com npm run test:e2e
```

---

## CI/CD

The `.github/workflows/playwright.yml` file defines two jobs that run sequentially:

| Job | Trigger | What it runs |
|-----|---------|-------------|
| `api-tests` | push to `master` / PR / nightly / manual | All API specs |
| `e2e-tests` | after `api-tests` passes | All E2E specs (Chromium) |

`e2e-tests` only starts if `api-tests` passes — no point running browsers when the backend contract is already broken. Both jobs run on every push to `master`, every pull request targeting `master`, and on a nightly cron (`06:00 UTC`) to catch regressions introduced by live-site changes rather than code changes.

HTML reports and failure artefacts (screenshots, videos, traces) are uploaded as workflow artefacts and retained for 7–14 days.

Manual runs via `workflow_dispatch` accept a `test_scope` input (`all` / `api` / `e2e`) to run only the relevant job.

To configure the target URLs in GitHub Actions, add Repository Variables:
- `BASE_URL`
- `API_BASE_URL`

If not set, both default to `https://automationexercise.com`.

---

## API coverage

All 14 documented endpoints from [automationexercise.com/api_list](https://auctomationexercise.com/api_list) are covered, plus additional negative and edge-case scenarios beyond the documented list.

| # | Method | Endpoint | Scenario | Spec |
|---|--------|----------|----------|------|
| 1 | GET | `/api/productsList` | Returns 200 + non-empty product array | `products-brands.spec.ts` |
| 2 | POST | `/api/productsList` | Returns 405 method not supported | `products-brands.spec.ts` |
| 3 | GET | `/api/brandsList` | Returns 200 + non-empty brands array | `products-brands.spec.ts` |
| 4 | PUT | `/api/brandsList` | Returns 405 method not supported | `products-brands.spec.ts` |
| 5 | POST | `/api/searchProduct` | With `search_product` param — returns matched results | `search.spec.ts` |
| 6 | POST | `/api/searchProduct` | Missing `search_product` param — returns 400 | `search.spec.ts` |
| 7 | POST | `/api/verifyLogin` | Valid credentials — returns 200 "User exists!" | `login.spec.ts` |
| 8 | POST | `/api/verifyLogin` | Missing email — returns 400 | `login.spec.ts` |
| 9 | DELETE | `/api/verifyLogin` | Returns 405 method not supported | `login.spec.ts` |
| 10 | POST | `/api/verifyLogin` | Invalid credentials — returns 404 | `login.spec.ts` |
| 11 | POST | `/api/createAccount` | Happy path — returns 201 "User created!" | `user-crud.spec.ts` |
| 12 | DELETE | `/api/deleteAccount` | Returns 200 "Account deleted!" | `user-crud.spec.ts` |
| 13 | PUT | `/api/updateAccount` | Returns 200, change verified by re-reading the account | `user-crud.spec.ts` |
| 14 | GET | `/api/getUserDetailByEmail` | Returns 200 with correct user profile | `user-crud.spec.ts` |

Extra scenarios added beyond the documented list:

- `verifyLogin` — missing password param (400)
- `verifyLogin` — wrong password for an existing email (404)
- `verifyLogin` — newly created user can immediately log in
- `createAccount` — duplicate email (400)
- `createAccount` — missing required fields (400)
- `deleteAccount` — account is gone after deletion (verified via getUserDetailByEmail → 404)
- `updateAccount` — non-existent user (404)
- `getUserDetailByEmail` — unknown email (404)
- `getUserDetailByEmail` — missing email parameter (400)
- `searchProduct` — no results for a non-matching term
- `productsList` — unique IDs, no missing required fields (schema validation)
- `brandsList` — known brand names present

---

## Test architecture decisions

### Why two Playwright projects?

`playwright.config.ts` defines separate projects for `api` and `e2e-chromium`. This allows:
- Running API tests without a browser binary installed
- Different timeout and retry settings per layer
- Independent CI jobs that fail independently and upload separate reports

### Why a custom `ApiClient`?

Rather than calling `request.post(...)` directly in every test, the `ApiClient` class centralises the base URL, endpoint paths, and form-encoding logic. Tests read like behaviour descriptions, not HTTP plumbing.

### Why Page Object Models?

POMs keep locators co-located with the page they belong to. When the site changes a selector, one file changes — not every test that touches that element.

### The HTTP 200 quirk

The API returns HTTP 200 at the transport level for **every** response, including error cases. The real status is always inside the JSON body as `responseCode`. All API assertions therefore check `body.responseCode` rather than `response.status()`, and the transport-level 200 is noted but not relied upon for semantics. This behaviour is documented as a finding in the exploratory testing report.

### Why ads are blocked in the fixture?

The demo site serves Google Ads iframes that occasionally reflow the page and intercept clicks, causing random failures unrelated to the code under test. Rather than sprinkling `try/catch` dismissal logic throughout tests, all ad-network domains are aborted at the network level in `e2e-fixtures.ts`. This is a deliberate scope decision — it trades visibility of ad-related issues for deterministic test results.

### Test isolation

- Each API test that creates a user **deletes it in the same test** (or in teardown).
- E2E tests that need an authenticated user use the `registeredUser` fixture, which creates an account via the API before the test and deletes it in teardown — even if the test fails. This means no test depends on pre-existing external state.
- The `EXISTING_USER` constant points to a stable pre-seeded account used only for login smoke tests — it is never deleted by the suite.

---

## Known limitations

- **Shared demo environment** — The site is public. If another user deletes the `EXISTING_USER` account or exhausts available product IDs, certain tests may fail.
- **Payment flow** — Uses a simulated card (`4111 1111 1111 1111`). The demo payment step may change without notice.
- **No Firefox / WebKit** — Cross-browser projects are included but commented out in the config. They can be re-enabled by uncommenting the relevant section in `playwright.config.ts`.

---

## Further reading

- [TEST_STRATEGY.md](./TEST_STRATEGY.md) — How I approached testing this system, prioritisation rationale, and tradeoffs.
- [EXPLORATORY_TESTING_REPORT.md](./EXPLORATORY_TESTING_REPORT.md) — Findings from a manual exploratory session, with severity and priority ratings.
