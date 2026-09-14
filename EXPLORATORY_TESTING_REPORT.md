# Exploratory Testing Report — automationexercise.com

**Tester:** Sanja Dinić
**Session:** ~90 min, September 2026
**Environment:** Chrome, macOS desktop — guest and registered user
**Approach:** charter-driven, findings verified manually and via API calls

---

## Charters

**Charter 1 — User journey (45 min)**
> Registration, search, cart and checkout as a new user. Focus on boundary conditions and data correctness.

**Charter 2 — API surface (45 min)**
> All 14 documented endpoints plus edge cases — missing params, wrong methods, wrong credentials, response contract.

---

## Findings

---

### ISSUE-01 — API always returns HTTP 200, including for errors

**Severity: High · Priority: High**

Every endpoint returns `200 OK` at transport level regardless of outcome. Errors like 400, 404 and 405 are only visible inside the JSON body as `responseCode`. Additionally, `GET /api/productsList` returns `Content-Type: text/html; charset=utf-8` while the payload is JSON.

Standard monitoring, load balancers and retry tooling read the status line — they will report 100% success while users are being rejected.

---

### ISSUE-02 — `updateAccount` reports "Account not found!" on wrong password

**Severity: Low · Priority: Medium**

`PUT /api/updateAccount` with a valid email and wrong password returns `responseCode: 404, message: "Account not found!"`. Repeating with the correct password succeeds, confirming the account exists. The message describes the wrong problem.

Returning the same response for "wrong password" and "account missing" is good practice against account enumeration. The fix is in the wording only — something like "Invalid credentials" is accurate and still non-revealing.

---

### ISSUE-03 — Non-existent product ID renders a blank detail page

**Severity: Medium · Priority: P2**

Navigating to `/product_details/9999` (a non-existent ID) returns HTTP 200 and renders the product detail page template with all fields empty — no product name, no price, no image. There is no 404, no redirect and no user-facing message.

Users who land on this URL (via a broken link or a deleted product) see a broken page with no indication something is wrong.

---

### ISSUE-04 — Enter key does not trigger search

**Severity: Low · Priority: P3**

On the Products page, typing a term and pressing Enter has no effect. Only clicking the search button works. This is unexpected keyboard behaviour and an accessibility concern — users navigating without a mouse cannot perform a search.

---

### ISSUE-05 — Space-only search returns the full product catalogue

**Severity: Low · Priority: P3**

Submitting a single space as a search term returns all 34 products under a "Searched Products" heading, visually identical to an empty search. Users get no feedback that their search was effectively empty.

---

### ISSUE-06 — Single-character passwords accepted

**Severity: Medium · Priority: P2**

Registration accepts a one-character password with no error. The account is created and fully functional. There are no visible password strength rules or minimum length requirements at the UI or API level.

---

### ISSUE-07 — No order reference number on confirmation page

**Severity: Medium · Priority: P2**

After completing checkout and payment, the confirmation page shows "Order Placed!" with no order ID or reference number. Users have nothing to quote to support if something goes wrong.

---

## Summary

| ID | Finding | Severity | Priority |
|----|---------|----------|----------|
| 01 | API always returns HTTP 200, wrong Content-Type on JSON endpoint | High | High |
| 02 | `updateAccount` says "Account not found" on wrong password | Low | Medium |
| 03 | Non-existent product ID renders blank page instead of 404 | Medium | P2 |
| 04 | Enter key does not trigger search | Low | P3 |
| 05 | Space search returns full catalogue | Low | P3 |
| 06 | No minimum password length enforced | Medium | P2 |
| 07 | No order reference number on confirmation | Medium | P2 |

---

## Minor observations

- Login error messages do not distinguish between wrong password and unknown email — both return "User not found!". Good practice for preventing account enumeration; worth protecting with a test.
- No password reset flow. Fine for a demo; a launch blocker in production.
- Product prices are stored as formatted strings (`"Rs. 500"`), not numeric values with a separate currency field. Parsing burden falls on every consumer.
- Mobile number field accepts any string including letters — no format validation client-side or via API.

---

## What I would explore next

- Cart behaviour when a guest with items logs in.
- Order history content and whether placed orders are actually retrievable.
