---
name: investigate
description: Systematic root-cause debugging methodology. Use when fixing bugs, investigating crashes, 500 errors, test failures, or broken behavior. Enforces the Iron Law (no fixes without proven root cause) and the 3-strike rule to stop agent thrashing.
argument-hint: "[error, failing test, or description of the bug]"
---

# Investigate (Systematic Debugging)

Debugging is hypothesis testing, not guess-and-check. Random edits compound errors, pollute git history, and break unrelated code.

Follow this methodology strictly whenever diagnosing or fixing a bug.

---

## The Iron Law

> **No code edits until the root cause is understood and verified by evidence.**
> Never apply a speculative patch hoping it fixes the symptom. Trace the cause first.

---

## 1. Scope & Freeze Boundary

Before touching anything:
- Identify the exact component, module, or files involved in the failure.
- Mentally **freeze** the rest of the codebase: do NOT edit or refactor unrelated files.
- If `/freeze` is available, lock edits to the relevant directory:
  ```bash
  /freeze <target_directory>
  ```

---

## 2. Reproduce with Evidence

Find or write the smallest possible reproduction:
- **CLI/Script:** The exact command line, input arguments, and exit code.
- **API/Worker:** The exact HTTP request payload, headers, and status code.
- **Web UI:** The URL, screen state, user interaction, and browser console/network error.
- **Unit/Integration Test:** The smallest test that triggers the failure.

State explicitly:
- **Expected:** What should happen according to the spec or normal behavior.
- **Actual:** What actually happens (exact error message, stack trace, or wrong value).

If you cannot reproduce the bug reliably, stop and ask the user for context, logs, or reproduction steps before guessing.

---

## 3. Trace Data Flow & Formulate Hypothesis

Do NOT write code yet. Trace the failure backward from the symptom:
1. **Locate the crash/error point:** Where does the exception get thrown or the bad value get produced?
2. **Trace data backward:** Where did that input come from? Which caller passed it? Where was it transformed?
3. **Form an explicit hypothesis:** State it plainly:
   > *"The function `X` fails because caller `Y` passes `Z` instead of `W` when condition `C` is met."*
4. **Verify the hypothesis:** Check the code, inspect state, or add minimal temporary logging to prove the hypothesis matches reality before fixing it.

---

## 4. The 3-Strike Rule (Anti-Thrashing)

Agents tend to get stuck in loops: try a guess, see it fail, try another guess, and gradually break more code.

Follow the 3-strike rule:
- **Strike 1:** If your first verified fix does not resolve the issue, STOP. Re-evaluate your hypothesis. Do not immediately try a second guess.
- **Strike 2:** If the second attempt fails, review all assumptions and data flow again from scratch.
- **Strike 3:** **HARD STOP.** Do not attempt a 4th fix.
  - Revert changes to a clean state.
  - Report to the user:
    1. What the exact symptom is.
    2. What was learned from the 3 attempts.
    3. The current unverified assumptions.
    4. Options or questions for how to proceed.

---

## 5. Minimal Fix & Regression Test

Once the root cause is proven:
1. **Write the regression test first:** Add an automated test that reproduces the bug. Run it and verify it **FAILS** for the identified root cause.
2. **Apply the minimal fix:** Use `ponytail` style — the simplest code that does the job. Avoid refactoring unrelated abstractions.
3. **Verify the test passes:** Run the regression test and confirm it now **PASSES**.
4. **Run the full test suite:** Ensure no other tests were broken by the fix.
5. **Clean up:** Remove any temporary debug logs or prints.
