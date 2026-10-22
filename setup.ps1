# Installs lippstack on Windows (PowerShell). Run it from the repo folder.
#
#   .\setup.ps1                              Claude Code: mods, skills and plugins
#   .\setup.ps1 -Agents codex,gemini-cli     also the skills for other agents (npx skills)
#
# Agent ids: codex, gemini-cli, kimi-code-cli, opencode, cursor, github-copilot, ...
# ('*' for every agent the skills CLI knows). Mods are Claude Code only.
param([string[]]$Agents = @())

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot

$lippPlugins = @(
    "savvy-progress@lippstack",
    "stage-bar@lippstack",
    "done-ping@lippstack",
    "where-line@lippstack",
    "guardrails@lippstack",
    "design-skills@lippstack",
    "po-skills@lippstack",
    "eng-skills@lippstack"
)

# Dean Peters' PM skills (CC BY-NC-SA 4.0): only the ones we use, out of 77.
$pmSkills = @(
    "user-story", "user-story-splitting", "epic-breakdown-advisor", "epic-hypothesis",
    "prd-development", "prioritization-advisor", "roadmap-planning", "discovery-process",
    "jobs-to-be-done", "problem-statement", "incoming-request-advisor", "stakeholder-mapping"
)

$officialPlugins = @("hookify", "claude-md-management", "session-report", "playwright")

# "Stop" doesn't cover native commands, so check their exit codes ourselves.
# A plain function (no param block), so flags like -y reach the program untouched.
function Invoke-Native {
    $exe, $rest = $args
    & $exe @rest
    if ($LASTEXITCODE -ne 0) { throw "$exe $rest failed (exit $LASTEXITCODE)" }
}
function Invoke-Claude { Invoke-Native claude @args }

function Install-Claude {
    Write-Host "==> Registering lippstack marketplace..." -ForegroundColor Cyan
    Invoke-Claude plugin marketplace add "$here"

    Write-Host "==> Installing lippstack plugins and skills..." -ForegroundColor Cyan
    foreach ($plugin in $lippPlugins) {
        Write-Host "Installing $plugin..." -ForegroundColor Gray
        Invoke-Claude plugin install $plugin
    }

    Write-Host "==> Installing ponytail..." -ForegroundColor Cyan
    Invoke-Claude plugin install ponytail@lippstack
    Write-Host "==> Installing humanizer..." -ForegroundColor Cyan
    Invoke-Claude plugin install humanizer@lippstack

    Write-Host "==> Registering PM skills marketplace..." -ForegroundColor Cyan
    Invoke-Claude plugin marketplace add deanpeters/Product-Manager-Skills
    foreach ($skill in $pmSkills) {
        Write-Host "Installing $skill@pm-skills..." -ForegroundColor Gray
        Invoke-Claude plugin install "$skill@pm-skills"
    }

    Write-Host "==> Registering official plugins..." -ForegroundColor Cyan
    Invoke-Claude plugin marketplace add anthropics/claude-plugins-official
    foreach ($plugin in $officialPlugins) {
        Write-Host "Installing $plugin@claude-plugins-official..." -ForegroundColor Gray
        Invoke-Claude plugin install "$plugin@claude-plugins-official"
    }

    Write-Host "==> Enabling built-in plugins..." -ForegroundColor Cyan
    Invoke-Claude plugin enable cc-plugin-you-should-know@builtin
}

function Install-Agents {
    if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
        throw "-Agents needs Node.js (npx) to run the skills CLI."
    }
    # Accepts -Agents codex,gemini-cli as well as -Agents "codex,gemini-cli".
    $list = $Agents -join "," -split "," | Where-Object { $_ }
    $flags = $list | ForEach-Object { "-a", $_ }
    $pm = $pmSkills | ForEach-Object { "-s", $_ }

    Write-Host "==> Installing lippstack skills for: $($list -join ', ')" -ForegroundColor Cyan
    Invoke-Native npx -y skills add "$here" -g @flags --skill "*" -y
    Write-Host "==> Installing ponytail for: $($list -join ', ')" -ForegroundColor Cyan
    Invoke-Native npx -y skills add DietrichGebert/ponytail -g @flags --skill "*" -y
    Write-Host "==> Installing humanizer for: $($list -join ', ')" -ForegroundColor Cyan
    Invoke-Native npx -y skills add blader/humanizer -g @flags --skill "*" -y
    Write-Host "==> Installing PM skills for: $($list -join ', ')" -ForegroundColor Cyan
    Invoke-Native npx -y skills add deanpeters/Product-Manager-Skills -g @flags @pm -y
}

if (Get-Command claude -ErrorAction SilentlyContinue) {
    Install-Claude
} elseif ($Agents.Count -eq 0) {
    Write-Error "'claude' CLI is not found in PATH. Install Claude Code, or use -Agents for other agents."
    exit 1
} else {
    Write-Host "==> 'claude' not found: skipping Claude Code, installing skills only." -ForegroundColor Yellow
}

if ($Agents.Count -gt 0) { Install-Agents }

Write-Host "`nDone! Restart your agent, or run /reload-plugins in an open Claude Code session." -ForegroundColor Green
