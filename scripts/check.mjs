#!/usr/bin/env node
// Repo consistency checks, no dependencies: node scripts/check.mjs
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []
const warnings = []
const rel = p => relative(root, p)
const read = p => readFileSync(join(root, p), 'utf8')

// Copied from upstream by scripts/sync-vendor.sh: report, don't fail.
const VENDORED = 'plugins/design-skills/'

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}
const files = walk(root)

// 1. Every JSON file parses.
for (const f of files.filter(f => f.endsWith('.json'))) {
  try {
    JSON.parse(readFileSync(f, 'utf8'))
  } catch (e) {
    errors.push(`${rel(f)}: invalid JSON (${e.message})`)
  }
}

// 2. Local marketplace plugins exist and their versions match plugin.json.
const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'))
const local = marketplace.plugins.filter(p => typeof p.source === 'string')
for (const p of local) {
  const manifest = join(p.source, '.claude-plugin/plugin.json')
  if (!existsSync(join(root, manifest))) {
    errors.push(`marketplace.json: ${p.name} points at ${p.source}, which has no ${manifest}`)
    continue
  }
  const own = JSON.parse(read(manifest))
  if (own.name !== p.name) errors.push(`${manifest}: name "${own.name}" but marketplace.json lists "${p.name}"`)
  if (own.version !== p.version) errors.push(`${p.name}: version ${p.version} in marketplace.json but ${own.version} in ${manifest}; bump both`)
}

// 3. SKILL.md frontmatter follows the Agent Skills spec, so every agent loads it.
function frontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (!m) return undefined
  const fields = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line)
    if (kv) fields[kv[1]] = kv[2].replace(/^(["'])(.*)\1$/, '$2')
  }
  return fields
}
const skills = files.filter(f => f.endsWith('/SKILL.md') || f.endsWith('\\SKILL.md'))
for (const f of skills) {
  const where = rel(f)
  const folder = dirname(f).split(/[\\/]/).pop()
  const fm = frontmatter(readFileSync(f, 'utf8'))
  if (!fm) {
    errors.push(`${where}: no frontmatter`)
    continue
  }
  if (fm.name !== folder) errors.push(`${where}: name "${fm.name}" must match its folder "${folder}"`)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name ?? '') || fm.name.length > 64)
    errors.push(`${where}: name must be lowercase letters, digits and hyphens, at most 64 characters`)
  if (!fm.description) errors.push(`${where}: description is missing`)
  else if (fm.description.length > 1024) errors.push(`${where}: description is ${fm.description.length} characters, the limit is 1024`)
  // Only Claude Code reads disable-model-invocation; other agents need it in words.
  if (fm['disable-model-invocation'] === 'true' && !/explicitly|only (runs?|when)/i.test(fm.description ?? '')) {
    const msg = `${where}: disable-model-invocation is Claude-only; say in the description that it runs only when explicitly asked`
    ;(where.startsWith(VENDORED) ? warnings : errors).push(msg)
  }
}

// 4. Every local plugin is installed by both setup scripts and the README's manual steps.
const setupSh = read('setup.sh')
const setupPs1 = read('setup.ps1')
const byHand = /### Or by hand[\s\S]*?```bash\n([\s\S]*?)```/.exec(read('README.md'))?.[1] ?? ''
if (!byHand) errors.push('README.md: no "### Or by hand" bash block found')
for (const { name } of local) {
  if (!new RegExp(`(^|[\\s"])${name}([\\s;"\\\\]|$)`, 'm').test(setupSh)) errors.push(`setup.sh does not install ${name}`)
  if (!setupPs1.includes(`"${name}@lippstack"`)) errors.push(`setup.ps1 does not install ${name}`)
  if (!byHand.includes(`claude plugin install ${name}@lippstack`)) errors.push(`README.md "Or by hand" does not install ${name}`)
}

// 5. Relative links in Markdown point at files that exist.
for (const f of files.filter(f => f.endsWith('.md'))) {
  const text = readFileSync(f, 'utf8').replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^([a-z]+:|#|\/)/i.test(target)) continue
    const path = decodeURIComponent(target.split('#')[0])
    if (path && !existsSync(join(dirname(f), path))) {
      const msg = `${rel(f)}: link to ${target} is broken`
      ;(rel(f).startsWith(VENDORED) ? warnings : errors).push(msg)
    }
  }
}

for (const w of warnings) console.log(`warning: ${w}`)
for (const e of errors) console.log(`error: ${e}`)
console.log(`${skills.length} skills, ${local.length} local plugins: ${errors.length} errors, ${warnings.length} warnings`)
process.exit(errors.length ? 1 : 0)
