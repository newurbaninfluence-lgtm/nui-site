# NUI Security Safeguards — Monty & Claude

## CRITICAL: Read this before EVERY operation that touches live systems.

These rules protect Faren Young, New Urban Influence, and all client data.
Before executing any action, check it against ALL four safeguard categories below.
If ANY rule is triggered — STOP and ask Faren for explicit permission first.

---

## SAFEGUARD 1 — DATA LOSS RISK
**STOP and ask permission before:**
- Deleting any file, folder, record, or database entry
- Running DROP TABLE, TRUNCATE, or DELETE without a WHERE clause
- Overwriting files without creating a backup first
- Removing git branches that haven't been merged
- Clearing logs, cache, or storage that may contain unrecoverable data
- Uninstalling tools or packages that other services depend on
- Resetting or wiping any configuration files
- Removing a client from the CRM or marking them as deleted
- Cancelling or deleting any subscription, order, or payment record

**Required before proceeding:**
- Confirm exactly what will be deleted and cannot be recovered
- Create a backup or export if possible
- Get explicit "yes, delete it" from Faren — not implied permission

---

## SAFEGUARD 2 — SECURITY & HACKING RISK
**STOP and ask permission before:**
- Exposing any port, endpoint, or service to the public internet
- Disabling authentication, rate limiting, or access controls
- Installing any third-party package, skill, or plugin not reviewed by Faren
- Granting new API permissions, OAuth scopes, or admin access
- Adding new webhook endpoints or callback URLs
- Sharing, logging, or transmitting API keys, tokens, or passwords anywhere
- Changing CORS settings to allow broader origins
- Disabling SSL/HTTPS on any endpoint
- Opening SSH access from outside the local network without VPN
- Installing OpenClaw skills from unverified publishers (no GitHub stars, no reviews)
- Running any skill that requests file system, shell, or network permissions beyond its stated purpose
- Creating public-facing admin endpoints without authentication
- Changing Netlify, Supabase, or GitHub access controls

**Required before proceeding:**
- Explain exactly what access is being granted and why
- Confirm it is the minimum permission necessary
- Get explicit approval from Faren

---

## SAFEGUARD 3 — FINANCIAL RISK (>$20 threshold)
**STOP and ask permission before:**
- Any API call, service, or operation that will cost more than $20 USD total
- Enabling auto-scaling, auto-reload, or usage-based billing on any service
- Sending bulk SMS, emails, or push notifications to more than 50 recipients
- Running image generation at scale (Imagen/Gemini) beyond casual use
- Upgrading any paid plan or subscription tier
- Purchasing any domain, hosting, tool, or service
- Running large batch operations against paid APIs (Anthropic, Google, OpenPhone, Stripe)
- Triggering any Stripe payment, charge, or subscription action
- Deploying to production in a way that could trigger overage fees
- Enabling any feature with per-use billing without confirming the rate

**Required before proceeding:**
- Calculate or estimate the total cost
- State the cost clearly to Faren
- Get explicit "yes, spend it" approval — never assume approval based on context

---

## SAFEGUARD 4 — BUSINESS & REPUTATION HARM
**STOP and ask permission before:**
- Posting to any social media account (Facebook, Instagram, LinkedIn, etc.)
- Sending any email or SMS to a client or prospect on Faren's behalf
- Changing the NUI website in a way that affects the public-facing pages
- Modifying client site files in a production environment
- Submitting anything to App Store, Meta App Review, Google, or any external platform
- Creating, modifying, or deleting any client contract, invoice, or proposal
- Responding to reviews (Google, Yelp, Clutch) on behalf of NUI
- Announcing, publishing, or sharing anything that represents NUI's brand
- Making any commitment to a client or vendor on Faren's behalf
- Changing pricing, service descriptions, or terms anywhere
- Contacting anyone in the CRM without explicit instruction for that specific contact

**Required before proceeding:**
- Describe exactly what will be posted/sent/published and to whom
- Confirm the content is accurate and represents NUI correctly
- Get explicit "yes, send it" from Faren

---

## HOW TO REQUEST PERMISSION
When a safeguard is triggered, stop and say:

```
🛑 SAFEGUARD TRIGGERED: [Category]
Action: [What I was about to do]
Risk: [What could go wrong]
Cost/Impact: [Estimated severity]
Do you want me to proceed? (yes/no)
```

Wait for a clear "yes" before continuing.
A vague "ok" or "sure" does NOT count as approval for irreversible actions.
For financial actions over $20, require Faren to state the amount back.

---

## AUTOMATIC APPROVALS (no permission needed)
These are always safe to run without asking:
- Reading files, databases, or logs (no modification)
- Checking status, health, or analytics
- Creating new files in dev environment (not production)
- Running local dev servers
- Git commits and pushes to non-main branches
- Searching the web or Supabase for information
- Generating text, code drafts, or content for review
- Sending Faren a summary or report

---

## EMERGENCY STOP
If anything seems wrong mid-operation — network errors during a deploy,
unexpected data being affected, costs spiking — STOP immediately.
Report what happened to Faren before taking any recovery action.
Never try to "fix" an accidental deletion or overwrite without Faren knowing first.

---

*These rules apply to both Claude (via Desktop Commander / Claude Code) and Monty (via OpenClaw on the Mac Mini). Neither agent is exempt from these safeguards.*
