---
name: jira-stories
description: Turn a feature, epic or PRD into user stories with acceptance criteria and create them in Jira after the user approves them. Use when the user asks to write stories "in Jira", "create the cards", "put this in the backlog", or to break an epic into Jira issues.
argument-hint: "[epic key, feature or PRD]"
---

# Jira stories

Write the stories, show them, and create them in Jira only after the user says yes. The draft is cheap; cards in someone's backlog are not.

Uses an Atlassian/Jira MCP server or connector (tools such as `getAccessibleAtlassianResources`, `createJiraIssue`, `searchJiraIssuesUsingJql`). If it is not connected, stop and say so; still offer the stories as text.

## 1. Gather

- **Source.** An epic key (read it with `getJiraIssue`), a PRD or spec (read the file or page), or a description in chat. If it is only a sentence, ask the two or three questions that change the stories: who the user is, what outcome counts as done, what is out of scope.
- **Target.** The project key and, if any, the parent epic. Ask when not given. `getVisibleJiraProjects` lists the projects; the cloud id comes from `getAccessibleAtlassianResources`.
- **House style.** Read 3 to 5 recent stories in that project (`searchJiraIssuesUsingJql`, `project = KEY AND issuetype = Story ORDER BY created DESC`). Copy their language (Portuguese or English), title style, description layout and labels. The team's conventions beat this skill's defaults.

## 2. Draft

One story per slice of value a user could notice. If the `user-story` or `user-story-splitting` skills are installed, follow them; otherwise use this format:

```
Title: <verb + object, short, as the team writes them>

As a <specific user>, I want <action> so that <outcome>.

Acceptance criteria
Scenario: <name>
  Given <context>
  When <action>
  Then <observable result>
```

- 2 to 5 scenarios per story, covering the main path and the edge cases that matter (empty, error, permission, limits).
- Split a story that needs more than about 5 scenarios or touches several user types.
- Never invent numbers, story points, deadlines or assignees. Leave estimates empty unless the user gives them.
- List what you left out of scope in one line.

## 3. Review with the user

Show a compact table: title, user, number of scenarios. Then the full text of each story. Ask: create all, change some, or drop some. Wait for an explicit yes.

## 4. Create

1. `getJiraProjectIssueTypesMetadata` for the story issue type's exact name (it may be "História") and id; `getJiraIssueTypeMetaWithFields` for the fields it requires. Ask the user for any required field you cannot fill truthfully.
2. Before each create, search for an open issue with the same title under the same epic. If one exists, skip it and say so.
3. `createJiraIssue` with the title as `summary`, the story text as `description` with `contentFormat: "markdown"`, the epic key as `parent`, and labels or components the team uses in `additional_fields`. If the project rejects `parent`, create the story and link it to the epic with `createIssueLink`.
4. Create them one at a time. If one fails, stop, report what was created and the error, and ask before going on.

## 5. Report

A list of created keys with links, anything skipped and why, and the out-of-scope line from the draft.
