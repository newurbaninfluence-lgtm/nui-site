---
name: fix-issue
description: Fix a GitHub issue end-to-end. Read the issue, find the relevant code, implement the fix, validate JS syntax, commit, and open a PR. Invoke with /fix-issue [issue-number].
disable-model-invocation: true
---

# Fix Issue Workflow

Fix a GitHub issue from start to PR in one command.

## Steps
1. Run `gh issue view $ARGUMENTS` to read the issue
2. Understand the exact problem being reported
3. Search the codebase for relevant files
4. Implement the fix — minimal change, no scope creep
5. Validate JS: `node -e "new Function(require('fs').readFileSync(FILE,'utf8'))"`
6. Test if a dev server is running
7. Commit: `git commit -m "fix: [issue description] #[number] $(date +%Y%m%d)v01"`
8. Push to a new branch: `fix/issue-[number]`
9. Open PR: `gh pr create --title "Fix #[number]: [description]" --body "Closes #[number]"`

## Safety — SAFEGUARD RULES
- SAFEGUARD 1: Never delete files as part of a fix — only modify
- SAFEGUARD 4: Never push directly to main — always create a branch
- If fix requires a database migration, stop and ask Faren first
