---
name: ship
description: Pre-flight release workflow. Verifies clean git status, runs test suites, checks documentation synchronization (Diataxis sanity check), creates atomic commit, pushes branch, and opens a Pull Request.
disable-model-invocation: true
argument-hint: "[optional PR title or target branch]"
---

# Ship (Pre-Flight & Pull Request Delivery)

Taking code from "done on my laptop" to "ready to merge" requires a reliable pre-flight checklist.

Use this skill when an implementation is complete and you want to verify, document, commit, and create a Pull Request.

---

## 1. Git State & Cleanliness

Before anything else:
1. Run `git status` to inspect modified and untracked files.
2. Check for leftover debug code:
   - Temporary `console.log`, `print`, `debugger`, or commented-out code.
   - Accidental secrets, `.env` files, or test output files.
3. Verify the base branch:
   - Identify base branch (usually `main` or `develop`).
   - Ensure the branch is up-to-date with upstream (`git fetch origin`).

---

## 2. Verification Gate

Run the project's quality checks:
1. **Automated Tests:** Run all unit, integration, and regression tests.
   - If any test fails: **STOP.** Do not push or open a PR with failing tests.
2. **Type Checking & Linting:** Run `tsc`, `eslint`, `cargo check`, `ruff`, or whatever the project uses.
3. **Build Check:** Ensure the project builds cleanly without errors.

---

## 3. Documentation Sanity Check (Diataxis)

Review the `git diff` against the base branch. Did the changes introduce new contracts?

Check if docs need updating **before** committing:
- **Reference / README:** New or changed CLI arguments, configuration keys, environment variables, or scripts.
- **How-To / Tutorials:** Changed setup steps, prerequisites, or developer workflows.
- **Specs & Plans:** Mark completed tasks in `docs/plans/` or reference the approved design in `docs/specs/`.

If docs are missing or outdated, update them now so the documentation moves with the code in the same PR.

---

## 4. Commit

Craft an atomic, conventional commit:
- Format: `<type>(<scope>): <short imperative summary>`
  - Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`.
- Provide a clear bulleted list in the commit body:
  - What changed.
  - Why the change was made.
  - Any architectural trade-offs or `shortcut:` annotations left for `ponytail-debt`.

---

## 5. Push & Pull Request

1. Push the branch to remote:
   ```bash
   git push -u origin <branch-name>
   ```
2. Create the Pull Request:
   - If `gh` CLI is available and authenticated:
     ```bash
     gh pr create --base <base-branch> --title "<title>" --body "<structured PR body>"
     ```
   - If `gh` is unavailable: print the PR title, description, and link for the user to open manually.
3. PR Body Structure:
   - **Summary:** 2-3 sentences explaining the problem and solution.
   - **Key Changes:** Bulleted breakdown of what was altered.
   - **Testing & Verification:** Evidence from tests, QA probes, or screenshots.
   - **Documentation:** Links to updated docs or specs.

---

## 6. Next Steps

- If working with Jira/Confluence: suggest running `release-notes` to update the release notes on Confluence.
- If running under review: suggest running `/ponytail-review` to double-check the final diff.
