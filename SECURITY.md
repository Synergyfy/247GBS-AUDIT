# Security hardening: preventing re-injected payloads

This repository was targeted by an obfuscated payload that was force-pushed
into several branches. The payload appeared as:

- tracked files named `init` at the repository / app roots
- `"dev": "node init && ..."` (and similar) entries in `package.json` scripts
- the same loader appended to `apps/web/postcss.config.mjs`
- a `.gitignore` change that stopped ignoring `.env*`

The tracked payload has been removed in this branch. This document covers the
controls that prevent it from being pushed again.

## 1. Remove the actor and rotate credentials first

Nothing below helps if the attacker/worm still has a valid token.

- Remove any unauthorized collaborator, deploy key, GitHub App, or PAT.
- Rotate the GitHub password, PATs, SSH keys, and any tokens stored on developer
  machines.
- Enable 2FA for every collaborator; prefer hardware security keys.
- Review **Settings → Collaborators**, **Settings → Deploy keys**,
  **Settings → GitHub Apps**, and personal **Settings → Sessions**.
- Review the repository/org **Audit log** for force pushes, collaborator
  changes, branch protection changes, and the IPs/user agents involved.

## 2. Protect `dev` and `main` with a ruleset / branch protection

On GitHub: **Settings → Rules → Rulesets** (preferred) or
**Settings → Branches → Branch protection rules**.

For both `dev` and `main`:

- Require a pull request before merging
- Require at least 1 approval (2 for `main` if possible)
- Dismiss stale approvals when new commits are pushed
- **Require review from Code Owners** (see `.github/CODEOWNERS`)
- Require status checks to pass, including **Security Guard**
- Require conversation resolution before merging
- **Block force pushes**
- Restrict deletions
- Require signed commits (once the team has signing set up)
- Do not allow bypassing the ruleset, including for admins

This is what turns the CI guard below from advice into an actual gate.

## 3. Turn on repository security features

- **Secret scanning** + **Push protection** (Code security settings)
- **Dependabot alerts** and security updates
- **CodeQL / code scanning** (optional but useful)
- Alerting on audit-log events for force pushes and branch protection changes

## 4. CI guard (already added)

`.github/workflows/security-guard.yml` runs `scripts/security-guard.mjs` on
every push, every pull request, and daily. It fails when it finds:

- tracked files named `init` or `config.bat`
- the obfuscator signatures from this incident
- `node init` in any `package.json` script
- a tracked `.env` file
- a `.gitignore` without the `.env*` rule
- unusually long lines or `eval`/`new Function` in Next/PostCSS/ESLint configs

Run it locally before pushing:

```bash
pnpm security:check
```

The workflow only helps if **Security Guard** is a required status check in the
branch protection/ruleset.

## 5. Least-privilege tokens

- Prefer fine-grained PATs scoped to the specific repository and permission.
- Give tokens an expiry date; never use a classic `repo` token for routine work.
- Do not store tokens in the repository, shell history, or committed config.
- Use SSH keys with a passphrase or hardware-backed keys where possible.
- Keep separate accounts/credentials per machine and revoke old ones.

## 6. Safe local workflow

- Do not run `pnpm dev`, `pnpm build`, or `pnpm install` on an unreviewed branch
  from an untrusted source.
- For an untrusted checkout, inspect `package.json` scripts and use
  `pnpm install --ignore-scripts`.
- Before running the app, check for the payload:
  ```bash
  git ls-files | grep -E '(^|/)(init|config\.bat)$'
  git grep -n 'node init' -- package.json apps/*/package.json
  git grep -n 'splitLane' -- .
  ```
- `git clean -ndx` shows ignored/untracked files before you delete them;
  `git clean -fdx` is destructive (it also removes `.env` files).

## 7. If a developer already pulled/ran an infected branch

Assume the machine is compromised:

- Rotate GitHub tokens/SSH keys, npm tokens, cloud credentials, and any secrets
  present on the machine.
- Check for persistence outside the repo (`~/.ssh`, shell profiles, cron/launch
  agents, `config.bat`, npm/gh config).
- Reimage the machine if the payload executed with the user's privileges.

Pulling the fixed branch removes the **tracked** files, but it does not undo
code that already ran.

## 8. Clean the other branches

The same payload was present on feature/fix branches. Merge this branch into
each one (or cherry-pick the security cleanup) before anyone uses them.
Old commits still contain the payload in history; purging history requires a
force-push/history rewrite and coordination with everyone who has a clone.
