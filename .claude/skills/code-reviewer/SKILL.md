---
name: code-reviewer
description: Automatically reviews and simplifies code after writing. Catches over-engineering, security issues, and style violations before committing. Triggers on any new JS/React file or function over 50 lines.
---

# Code Reviewer — NUI Standards

Review all code against NUI's stack standards before committing.

## NUI Stack Rules
- Framework: Vite + React or vanilla JS
- No jQuery, no lodash unless absolutely necessary
- ES modules only (import/export), never require()
- Async/await over .then() chains
- Supabase client: always use service key on server, anon on client
- Never hardcode API keys — always process.env
- Netlify functions: always include CORS headers
- Always validate JS with: node -e "new Function(require('fs').readFileSync(FILE,'utf8'))"
- Version strings: 20260316vNN pattern

## What to check
1. Are there any hardcoded secrets, keys, or tokens?
2. Is there duplicate logic that already exists in another function?
3. Is the CORS handling correct?
4. Are Supabase calls using the right key (service vs anon)?
5. Is error handling present and useful?
6. Would this break mobile or slow connections?

## Output
- List of issues found (critical / warning / suggestion)
- Simplified rewrite if over-engineered
- Clear "READY TO COMMIT" or "NEEDS FIXES" verdict

## Safety
- SAFEGUARD 1: Never delete existing code without showing a diff
- SAFEGUARD 2: Flag any code that could expose credentials or bypass auth
