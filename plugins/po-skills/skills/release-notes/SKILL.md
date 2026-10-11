---
name: release-notes
description: Write release notes from the Jira issues finished in a sprint, version or date range, in two versions (one for the team, one for the business), and publish them to Confluence after the user approves. Use when the user asks for release notes, a sprint summary, "what did we ship", or a changelog for stakeholders.
argument-hint: "[project + sprint, version or dates]"
---

# Release notes

Turn finished Jira work into notes people read. Everything in the notes must come from the issues; when an issue does not say why it matters, say less rather than invent it.

Uses the Atlassian connector (Jira search, Confluence pages). If it is not connected, stop and say so.

## 1. Find the work

- Ask for the project and the window when not given: a sprint name, a fix version, or dates.
- Search with `searchJiraIssuesUsingJql`, for example:
  - sprint: `project = KEY AND sprint = "Sprint 42" AND statusCategory = Done`
  - version: `project = KEY AND fixVersion = "1.8.0" AND statusCategory = Done`
  - dates: `project = KEY AND statusCategory = Done AND resolved >= 2026-10-01 AND resolved < 2026-10-15`
- Read each issue's title, type, description, epic and labels. Open an issue with `getJiraIssue` only when its title alone does not say what changed.

## 2. Sort

- **New:** stories and features users can see.
- **Improved:** changes to something that already existed.
- **Fixed:** bugs, written as what works now, not what was broken.
- **Left out:** sub-tasks, spikes, internal tech debt and anything with no visible effect. List them at the end of the draft so the user can pull one back in.

Group by epic when there are more than about 10 items.

## 3. Write two versions

**For the team.** Every item with its key and link, one line each, grouped as above. Mention anything to watch: migrations, feature flags, known issues found in the issues.

**For the business.** No keys, no jargon. A two-sentence summary on top, then the items that matter to users or the business, each as what someone can do now. Leave out the rest. Use the language the team uses in Jira (Portuguese or English) unless the user asks otherwise.

Never invent metrics, customer quotes or impact. If an item's benefit is not in the issue, describe the change plainly.

## 4. Review and publish

1. Show both versions in chat with the left-out list and ask for changes.
2. After an explicit yes, ask where it goes: the Confluence space (`getConfluenceSpaces`) and parent page, or an existing page to update. Suggest the title `Release notes: <project> <sprint or version>`.
3. Create it with `createConfluencePage` (or `updateConfluencePage` for an existing page) using `contentFormat: "markdown"`, with the business version first and the team version under a "Details" heading. Offer to save it as a draft (`status: "draft"`) if the user wants to edit it in Confluence before others see it.
4. Reply with the page link.
