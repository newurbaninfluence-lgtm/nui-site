// netlify/functions/utils/claude-json.js
// ─────────────────────────────────────────────────────────────────────────────
// Get structured JSON out of Claude reliably.
//
// The blogger asked for "ONLY valid JSON" in plain text and then JSON.parse'd
// the reply. Long HTML in a JSON string breaks that constantly (raw newlines,
// stray quotes, ```json fences) — 22 of 30 runs failed with
// "Blog JSON parse failed".
//
// Fix: force a tool call. The API returns the tool input as an already-parsed
// object, so there is nothing to parse. If the model somehow answers in text,
// fall back to a tolerant parser.
// ─────────────────────────────────────────────────────────────────────────────

function stripFences(raw) {
  return String(raw || '')
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

// Escape raw control characters that appear inside JSON string literals.
function escapeControlCharsInStrings(s) {
  let out = '';
  let inStr = false;
  let esc = false;
  for (const ch of s) {
    if (inStr) {
      if (esc) { out += ch; esc = false; continue; }
      if (ch === '\\') { out += ch; esc = true; continue; }
      if (ch === '"') { out += ch; inStr = false; continue; }
      if (ch === '\n') { out += '\\n'; continue; }
      if (ch === '\r') { out += '\\r'; continue; }
      if (ch === '\t') { out += '\\t'; continue; }
      out += ch;
    } else {
      if (ch === '"') inStr = true;
      out += ch;
    }
  }
  return out;
}

function parseLooseJSON(raw) {
  const cleaned = stripFences(raw);
  const attempts = [cleaned];
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last > first) attempts.push(cleaned.slice(first, last + 1));
  for (const a of attempts) {
    try { return JSON.parse(a); } catch {}
    try { return JSON.parse(escapeControlCharsInStrings(a)); } catch {}
  }
  throw new Error('JSON parse failed: ' + cleaned.slice(0, 200));
}

// schema: JSON Schema object for the tool input.
async function callClaudeJSON({ apiKey, model, maxTokens, prompt, toolName, toolDescription, schema }) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      tools: [{ name: toolName, description: toolDescription || 'Return the result.', input_schema: schema }],
      tool_choice: { type: 'tool', name: toolName },
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`Claude API ${r.status}: ${JSON.stringify(d).slice(0, 200)}`);
  if (d.stop_reason === 'max_tokens') {
    throw new Error('Claude output truncated (hit max_tokens) — raise the limit or shorten the prompt');
  }
  const tool = (d.content || []).find((c) => c.type === 'tool_use' && c.name === toolName);
  if (tool && tool.input && typeof tool.input === 'object') return tool.input;
  const text = (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
  return parseLooseJSON(text);
}

module.exports = { callClaudeJSON, parseLooseJSON, stripFences };
