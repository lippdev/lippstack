# Installs the lippstack mods on Windows (PowerShell). Run it from the repo folder.
$ErrorActionPreference = "Stop"

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Error "Error: 'claude' CLI is not found in PATH. Please install Claude Code first."
    exit 1
}

$here = $PSScriptRoot

Write-Host "==> Registering lippstack marketplace..." -ForegroundColor Cyan
claude plugin marketplace add "$here"

$lippPlugins = @(
    "savvy-progress@lippstack",
    "stage-bar@lippstack",
    "done-ping@lippstack",
    "where-line@lippstack",
    "design-skills@lippstack",
    "po-skills@lippstack",
    "eng-skills@lippstack"
)

Write-Host "==> Installing lippstack plugins and skills..." -ForegroundColor Cyan
foreach ($plugin in $lippPlugins) {
    Write-Host "Installing $plugin..." -ForegroundColor Gray
    claude plugin install $plugin
}

Write-Host "==> Installing ponytail..." -ForegroundColor Cyan
claude plugin install ponytail@lippstack

Write-Host "==> Registering PM skills marketplace..." -ForegroundColor Cyan
claude plugin marketplace add deanpeters/Product-Manager-Skills

$pmSkills = @(
    "user-story", "user-story-splitting", "epic-breakdown-advisor", "epic-hypothesis",
    "prd-development", "prioritization-advisor", "roadmap-planning", "discovery-process",
    "jobs-to-be-done", "problem-statement", "incoming-request-advisor", "stakeholder-mapping"
)

foreach ($skill in $pmSkills) {
    Write-Host "Installing $skill@pm-skills..." -ForegroundColor Gray
    claude plugin install "$skill@pm-skills"
}

Write-Host "==> Registering official plugins..." -ForegroundColor Cyan
claude plugin marketplace add anthropics/claude-plugins-official

$officialPlugins = @("hookify", "claude-md-management", "session-report", "playwright")
foreach ($plugin in $officialPlugins) {
    Write-Host "Installing $plugin@claude-plugins-official..." -ForegroundColor Gray
    claude plugin install "$plugin@claude-plugins-official"
}

Write-Host "==> Enabling built-in plugins..." -ForegroundColor Cyan
claude plugin enable cc-plugin-you-should-know@builtin

Write-Host "`nDone! Restart Claude Code, or run /reload-plugins in an open session." -ForegroundColor Green
