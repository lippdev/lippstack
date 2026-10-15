---
name: qa
description: Exploratory quality assurance and behavioral verification across Web UI, APIs, CLIs, and background workers. Enforces the Golden Regression Rule (every bug discovered must have an automated test that fails before the fix and passes after).
argument-hint: "[URL, feature, CLI command, or endpoint to verify]"
---

# QA (Exploratory Verification & Regression Gate)

Building code is only half the job. Code is not done when it compiles; it is done when behavior is verified against real constraints and adversarial inputs.

Use this skill to systematically test changes beyond the happy path.

---

## The Golden Regression Rule

> **Never fix a discovered bug without an automated regression test.**
> 1. Write the test that reproduces the bug.
> 2. Verify the test **FAILS**.
> 3. Apply the minimal fix.
> 4. Verify the test **PASSES**.

If an automated test is genuinely impossible (e.g. third-party hardware interaction), document the exact manual reproduction steps in the report.

---

## 1. Surface Detection & Plan

Identify the target surface and required tools:
- **Web UI:** Local server, browser automation (Playwright, Aside, or local preview tools).
- **REST/GraphQL API:** HTTP client (`curl`, test fixtures, staging URL).
- **CLI / Script:** Shell command execution with varying flags, inputs, environment variables, exit codes, stdout/stderr.
- **Worker / Background Job:** Message queue payloads, duplicate deliveries, timeout/retry behaviors.
- **Core Library:** Unit and integration test suites.

State the surface and plan in one concise line before starting.

---

## 2. Exploratory Testing (Beyond the Happy Path)

Do not just test the ideal input. Systematically probe these failure modes:

| Category | What to probe | Examples |
|---|---|---|
| **Empty / Boundary** | Zero values, empty lists, 1-item lists, max limits | Empty search results, 0-item cart, 10,000-character name |
| **Malformed / Hostile** | Special characters, emoji, SQL/HTML injection strings | `null`, `undefined`, `"🚀"`, `<script>`, whitespace-only |
| **Duplicates & Idempotency** | Double-clicks, duplicate API requests, concurrent actions | Rapidly clicking "Submit" twice; submitting the same form with duplicate IDs |
| **Interruption & Resiliency** | Aborted requests, network timeouts, partial failure recovery | Client disconnection mid-request, missing config or environment variables |
| **Permissions & Auth** | Unauthenticated access, expired tokens, role mismatches | Accessing private routes logged out or as an unauthorized role |

---

## 3. Browser & UI Specific QA (When Web is in scope)

When testing Web UI:
1. **Visual Polish:** Check typography, responsiveness across mobile and desktop widths, content overflow.
2. **Console & Network:** Check for unhandled exceptions, 4xx/5xx network calls, or warning spam in the browser console.
3. **Worst-Case Data:** Combine with `break-ui` to stress-test components with excessively long names, missing avatars, and extreme numbers.

---

## 4. Evidence & Bug Reporting

For every defect found:
1. **Log the Finding:**
   - **Severity:** Critical (crash/data loss), High (core flow blocked), Medium (sub-optimal UX or edge case), Low (cosmetic).
   - **Steps to Reproduce:** Exact sequence of actions or command.
   - **Observed vs Expected:** What actually happened vs what should happen.
2. **Apply the Golden Regression Rule:**
   - Create a failing regression test before repairing the bug.
   - Verify the repair passes both the new regression test and all existing suites.

---

## 5. QA Readiness Report

Conclude with a clear, structured summary:
- **Status:** `READY TO SHIP` | `CHANGES REQUIRED` | `BLOCKED`
- **Surfaces Verified:** List of components, endpoints, or pages tested.
- **Probes Executed:** Key edge cases and scenarios explored.
- **Bugs Fixed & Regression Tests Added:** Links or names of new regression tests.
- **Residual Risks / Coverage Gaps:** Any external dependencies, unmocked third parties, or manual steps remaining.
