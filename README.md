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

The `.github/workflows/playwright.yml` file defines two jobs:

| Job | Trigger | What it runs |
|-----|---------|-------------|
| `api-tests` | push to `master` / PR / manual | All API specs |
| `e2e-tests` | push to `master` / PR / manual | All E2E specs (Chromium) |

Both jobs run in parallel on every push to `master` and on every pull request targeting `master`. HTML reports and failure artefacts (screenshots, videos, traces) are uploaded as workflow artefacts and retained for 7–14 days.

To configure the target URLs in GitHub Actions, add Repository Variables:
- `BASE_URL`
- `API_BASE_URL`

If not set, both default to `https://automationexercise.com`.

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

### Test isolation

- Each API test that creates a user **deletes it in the same test** (or in cleanup).
- E2E tests that create an account delete it via the UI at the end of the test.
- The `EXISTING_USER` constant points to a stable pre-seeded account used only for login/logout tests — it is never deleted by the suite.

---

## Known limitations

- **Shared demo environment** — The site is public. If another user deletes the `EXISTING_USER` account or exhausts available product IDs, certain tests may fail.
- **Payment flow** — Uses a simulated card (`4111 1111 1111 1111`). The demo payment step may change without notice.
- **No Firefox / WebKit** — Cross-browser projects are included but commented out in the config. They can be re-enabled by uncommenting the relevant section in `playwright.config.ts`.

---

## Further reading

- [TEST_STRATEGY.md](./TEST_STRATEGY.md) — How I approached testing this system, prioritisation rationale, and tradeoffs.
- [EXPLORATORY_TESTING_REPORT.md](./EXPLORATORY_TESTING_REPORT.md) — Findings from a manual exploratory session, with severity and priority ratings.
