---
name: nui-deploy
description: Full NUI site deployment workflow. Validates JS, runs git push, triggers Netlify deploy, and confirms success. The safe, standardized way to ship NUI changes.
disable-model-invocation: true
---

# NUI Deploy Workflow

The only way code should go to production on NUI.

## Pre-deploy checklist
1. Validate all edited JS files:
   `node -e "new Function(require('fs').readFileSync('FILE','utf8'))"`
2. Check no API keys are hardcoded:
   `grep -r "sk-ant\|eyJ\|AIza\|SG\." --include="*.js" . | grep -v node_modules | grep -v ".git"`
3. Confirm git status is clean: `git status`
4. Run: `git add -A && git commit -m "feat/fix: [description] $(date +%Y%m%d)v01"`
5. Push: `git push origin main`
6. Monitor Netlify build

## Post-deploy verification
- Check: https://newurbaninfluence.com is loading
- Check: https://newurbaninfluence.com/.netlify/functions/nui-chat responds
- Report deploy URL and status to Faren

## Safety — SAFEGUARD RULES
- SAFEGUARD 4: Always confirm with Faren before deploying to production
- SAFEGUARD 1: Never force push — if there are conflicts, resolve them first
- SAFEGUARD 2: If secrets scan finds exposed keys, STOP — do not deploy
- If build fails on Netlify, report the error before attempting a fix
