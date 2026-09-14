# Test Strategy — automationexercise.com

**Author:** Sanja Dinić
**Scope:** automationexercise.com — web UI and REST API

---

## 1. Approach

Before writing a single test I asked: what actually matters here? For a shop, the answer is simple — users need to find something, put it in a cart, and pay for it. If that works, the business runs. If it doesn't, nothing else matters.

That shaped everything. More tests at the API layer where things are fast and predictable, fewer in the browser where they're slow and fragile, and exploratory sessions to catch what neither of those picks up.

| Layer | Coverage | Why here |
|-------|----------|----------|
| API | Catalogue, search, auth, user lifecycle, error handling | 10x faster than E2E, easier to debug, covers most of the logic |
| E2E | Registration, login, cart, checkout | Only these need a real browser to prove they work end-to-end |
| Exploratory | Edge cases, usability, third-party behaviour | Some things you just have to click around to find |

No access to source code or a staging environment, so this suite tests the application from the outside.

---

## 2. What I prioritised

**Core — always runs, blocks the pipeline if broken:**
- Login and registration. Without an account nothing else works.
- Search. A shop where you can't find products doesn't sell anything.
- Add to cart with correct quantities and totals.
- Full checkout to order confirmation.
- All 14 API contracts — they underpin everything else.

**Secondary — important but not pipeline-blocking:**
- Duplicate email, wrong password, update and delete account
- Session handling, logout
- Search edge cases

**Not automated:**
- Static content, forms that send real emails, reviews, layout — all quicker to check manually than to automate and maintain.

I only automate something when it's worth the ongoing maintenance cost. If it's low-risk or one-off, exploratory testing is the right call.

---

## 3. When to use API vs E2E

The deciding question: does this need a browser to be meaningful?

**API tests cover:**
- Whether the server returns the right data and the right errors
- Business rules — bad inputs, duplicate accounts, wrong credentials
- Anything with lots of variations (testing six login error cases via API takes seconds; in a browser it takes minutes and proves nothing extra)
- Setting up state for other tests

**E2E tests cover:**
- Flows that span multiple pages where session state matters
- Cases where the browser rendering is part of what needs to be correct
- The user-visible outcome, not just the response payload

In practice: E2E specs create test accounts through the API, then start clicking. Registration gets one browser test because the form itself is what's being tested. Everything else starts from an already-existing user.

---

## 4. Risks and how I handled them

| Risk | What could go wrong | What I did about it |
|------|--------------------|--------------------|
| Public shared environment | Someone else changes data between tests | Every test creates its own data with a unique email and cleans up after itself |
| Google Ads overlays | Ads reflow the page and intercept clicks | All ad domains blocked at network level in the test fixture |
| API always returns HTTP 200 | Errors look like successes to any standard monitoring tool | All assertions check `responseCode` in the body, not the HTTP status |
| Catalogue changes without notice | Specific product assertions would break | Tests check structure and invariants, not specific product names or prices |
| No staging environment | Can't isolate test runs from real traffic | Accepted — nightly runs help separate our changes from their changes |

---

## 5. Assumptions

- What's on `/api_list` is the full public API — nothing undocumented is in scope.
- Payment is a demo stub, no real transactions.
- Test data can be deleted by other users at any time — nothing persists between runs.
- Chromium only. Firefox and Safari would be added once the suite is stable.

---

## 6. What I skipped and why

| Area | Why skipped |
|------|------------|
| Load and performance testing | Wrong environment for it — a shared public demo gives meaningless numbers |
| Security testing beyond basics | Needs written permission and specialist tooling |
| Cross-browser | Adds noise before the suite is proven stable |
| Visual regression | Ads change on every load — screenshot diffs would be useless without stubbing them |
| Contact form, static pages, reviews | Not worth automating — low risk, fast to check by hand |
| Payment provider internals | It's a stub, asserting on it gives false confidence |

---

## 7. How CI is set up

- API tests run first. E2E only starts if they pass — no point spinning up browsers when the backend is already broken.
- Both run on every push and PR, and on a nightly schedule to catch changes on the site's side.
- On failure: HTML report, screenshots, video and traces are uploaded so any failure can be diagnosed without re-running locally.
- Retries are set to 1 in CI. If a test only passes on retry, it's flaky — it gets fixed, not ignored.
