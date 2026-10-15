---
name: freeze
description: Restrict file edits to a specific directory or module for the duration of a task or bugfix. Prevents accidental modifications to unrelated parts of the codebase.
disable-model-invocation: true
argument-hint: "<directory or file path>"
---

# Freeze (Editing Scope Boundary)

When debugging, refactoring, or working on a tightly scoped feature, agents can easily "wander" into unrelated files or make unrequested sweeping changes.

Use `/freeze <path>` to establish an explicit editing boundary.

---

## Behavior Rules

1. **Active Boundary:** Once invoked with a path (e.g. `src/auth/` or `packages/api/`), all file write, edit, and create operations **MUST** be strictly confined within that directory tree.
2. **Outside Edits Blocked:** If a solution seems to require editing a file outside the frozen boundary:
   - **STOP immediately.**
   - Do not edit the outside file.
   - Explain to the user why the boundary needs to be expanded or why an external edit is needed.
   - Wait for explicit user confirmation before touching files outside the boundary.
3. **Read-Only Outside:** Reading files outside the boundary (for reference, type checking, or context) is permitted; only modifications are restricted.
4. **Unfreezing:** The freeze remains active until the task completes or the user says `unfreeze` / `/freeze off`.
