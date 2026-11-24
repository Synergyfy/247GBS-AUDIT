#!/usr/bin/env node
/**
 * Repository guard against the injected `init` payload found on the 247GBS
 * branches. Runs in CI and locally via `pnpm security:check`.
 *
 * It scans the tracked tree (not node_modules) for:
 *  - malware filenames (`init`, `config.bat`)
 *  - obfuscator signatures
 *  - `node init` in package.json scripts
 *  - tracked .env files
 *  - .gitignore losing the `.env*` rule
 *  - long / eval-laden config files
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const FAIL = [];
const WARN = [];
const fail = (file, message) => FAIL.push({ file, message });
const warn = (file, message) => WARN.push({ file, message });

// The guard itself and its documentation necessarily mention the signatures.
const ALLOWLIST = new Set([
  'scripts/security-guard.mjs',
  'SECURITY.md',
  '.github/workflows/security-guard.yml',
  '.github/CODEOWNERS',
]);

const FORBIDDEN_BASENAMES = new Set(['init', 'config.bat']);
const FORBIDDEN_SIGNATURES = [
  'splitLane',
  'peel(',
  '\\u0063\\u0068\\u0061\\u0072\\u0041\\u0074',
  'NX=[6912847',
];

function isTrackedEnv(file) {
  return (
    /(^|\/)\.env(\..+)?$/.test(file) &&
    !file.endsWith('.env.example') &&
    !file.endsWith('.env.sample')
  );
}

for (const file of files) {
  const base = file.split('/').pop() ?? file;

  if (FORBIDDEN_BASENAMES.has(base)) {
    fail(file, `forbidden malware filename "${base}"`);
  }

  if (isTrackedEnv(file)) {
    fail(file, 'environment file must not be tracked');
  }

  if (ALLOWLIST.has(file)) continue;

  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  for (const signature of FORBIDDEN_SIGNATURES) {
    if (content.includes(signature)) {
      fail(file, `suspicious obfuscator signature "${signature}"`);
    }
  }

  if (base === 'package.json') {
    let pkg;
    try {
      pkg = JSON.parse(content);
    } catch {
      continue;
    }
    for (const [name, command] of Object.entries(pkg.scripts ?? {})) {
      const cmd = String(command);
      if (/\bnode\s+(\.\/)?init(\.js)?\b/.test(cmd)) {
        fail(file, `script "${name}" executes the init payload: ${cmd}`);
      }
      if (/\b(curl|wget)\b/.test(cmd) || /\|\s*(bash|sh)\b/.test(cmd)) {
        warn(file, `script "${name}" downloads or pipes a shell command`);
      }
      if (/\b(eval|new Function)\b/.test(cmd)) {
        warn(file, `script "${name}" uses eval/Function`);
      }
    }
  }

  if (file === '.gitignore') {
    if (!/(^|\n)\.env\*(\s|$)/.test(content)) {
      fail(file, 'missing `.env*` ignore rule');
    }
  }

  if (/(^|\/)(postcss|next|tailwind|eslint)\.config\.[cm]?[jt]s$/.test(file)) {
    const longest = Math.max(
      0,
      ...content.split(/\r?\n/).map((line) => line.length),
    );
    if (longest > 2000) {
      fail(file, `config file has a suspiciously long line (${longest} chars)`);
    }
    if (/\b(eval|new Function)\s*\(/.test(content)) {
      fail(file, 'config file uses eval/Function');
    }
  }
}

for (const { file, message } of WARN) {
  console.log(`::warning file=${file}::${message}`);
}
for (const { file, message } of FAIL) {
  console.log(`::error file=${file}::${message}`);
}

if (FAIL.length > 0) {
  console.error(`\nSecurity guard failed with ${FAIL.length} issue(s).`);
  process.exit(1);
}

console.log(`Security guard passed (${files.length} tracked files scanned).`);
