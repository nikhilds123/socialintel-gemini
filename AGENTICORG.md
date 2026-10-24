# AgenticOrg test route (company analysis)

Temporary experiment: build the Product Profile (the "DNA" step) with an AgenticOrg marketing agent
instead of Claude. Off by default. Every failure falls back to the existing Claude path, so the
working flow is untouched.

## What AgenticOrg exposes (verified 2026-10-24)

| Thing | Value |
|---|---|
| Base URL | `https://app.agenticorg.ai` (same backend as `agenticorg.pinelabs.com`) |
| Auth | `Authorization: Bearer ao_sk_...` (key from dashboard → Settings → API Keys) |
| Run by type | `POST /api/v1/a2a/tasks` body `{agent_type, company_id, action, inputs, context:{company_id}}` |
| Result shape | `AgentRunResult`: `run_id, status (completed/failed/hitl_triggered/budget_exceeded), output{}, confidence, reasoning_trace[], tool_calls[], error` |
| Public catalog | `GET /api/v1/a2a/agents` — 55 agents, none does website analysis natively |
| Marketing agents | `competitive_intel` (domain rating, organic keywords, mentions, share of voice, backlinks), `brand_monitor`, `seo_strategist`, `social_media`, `content_factory`, `product_agent` |
| Agent inputs | free-form `inputs{}` object, so we pass `url, description, page_title, page_text, task, output_schema` |
| CORS | **Browser origins are rejected** (`Disallowed CORS origin` on preflight, even for `app.agenticorg.ai`). No direct `fetch()` from the artifact. |
| Remote MCP at `/mcp` | OAuth, marketplace **buyer** surface only (`buyer_agent:*`, `payment:*` scopes). Not usable for agent runs. |
| Local MCP | `npx agenticorg-mcp-server@5.0.0` (stdio) — tool `run_agent {agent_type, company_id, action, inputs}` → posts to `/a2a/tasks` and returns the JSON as text |

Because of the CORS block, the artifact reaches AgenticOrg through the **local MCP server on the Claude
desktop app** (`host:agenticorg` in the artifact's connector manifest). That only works when the page is
opened in the Claude desktop app, by the artifact owner, with the server configured there.

## 1. Try it from the terminal first (fastest signal)

```bash
export AGENTICORG_API_KEY=ao_sk_...
node tools/ao-probe.mjs --whoami            # prints /auth/me and /companies → copy the company UUID
export AGENTICORG_COMPANY_ID=<uuid>
node tools/ao-probe.mjs https://yourproduct.com "one line on what it does"
node tools/ao-probe.mjs https://yourproduct.com --agent brand_monitor --raw
```

The probe fetches the page itself, sends the exact `inputs` the app sends, prints status/confidence/latency/
tool calls, and says whether the output parses into the profile shape. Full response lands in
`tools/ao-last-run.json`.

## 2. Wire it into the artifact

1. Claude desktop app → Settings → Developer → Edit Config, add:

```json
{
  "mcpServers": {
    "agenticorg": {
      "command": "npx",
      "args": ["--yes", "agenticorg-mcp-server@5.0.0"],
      "env": {
        "AGENTICORG_API_KEY": "ao_sk_...",
        "AGENTICORG_BASE_URL": "https://app.agenticorg.ai"
      }
    }
  }
}
```

   Restart the desktop app. The key stays in that config, never in the HTML.

2. Claude Code picks the same server up from `.mcp.json` in this folder (reads `AGENTICORG_API_KEY` from
   your shell env). Approve it when prompted on the next session.

3. Open the Plug artifact in the Claude desktop app. Intake screen → **Labs** panel (under the
   "load an example" link) → tick *Use AgenticOrg*, pick the agent, paste the company UUID. Settings
   persist in this browser.

4. Run an analysis. On the analysing screen, stage 2 reports what AgenticOrg did. The profile screen shows
   a `Labs` line: *Profile built by AgenticOrg · competitive_intel · 74% agent confidence · 21s*, or
   *AgenticOrg answer, shaped by Claude* when the agent returned prose instead of the JSON shape, or
   *AgenticOrg fell back to Claude: …* with the reason.

## How the fallback decides

```
Labs off ───────────────────────────────────────────► Claude (unchanged path)
Labs on, no MCP capability / no company UUID ───────► Claude, reason shown
run_agent rejects (server_not_connected, tool_error,
  approval_required, cancelled/timeout 170s, …) ─────► Claude, reason shown
status != completed (failed / hitl / budget) ───────► Claude, reason shown
completed, output parses to profile JSON ───────────► AgenticOrg profile used directly
completed, output is prose / other JSON ────────────► Claude writes the profile with the
                                                      AgenticOrg output as evidence
```

Per project, `proj.dnaSource`, `proj.aoRun` and `proj.aoError` are stored in localStorage for inspection.

## Known limits

- Host MCP calls only work in the Claude desktop app, only for the artifact owner. A browser tab gets
  `server_not_connected` and silently uses Claude.
- `competitive_intel`'s tools are SEO-data connectors (Ahrefs-style). Without those connectors set up in
  your AgenticOrg tenant, the agent answers from Gemini reasoning over the page text we send.
- The MCP server has no streaming; a long agent run just waits (timeout 170s in the app).
- `company_id` must be a company in your tenant; the API returns 400 without it.

## Better route: a custom agent made in the dashboard

Dashboard → Agents → Create Virtual Employee → "Describe the employee you need" is the UI for
`POST /api/v1/agents/generate` (SDK `client.agents.generate(description)`). It drafts a full agent
config (name, domain, prompt, tools) for review, then deploys it as a **shadow candidate**; promote it
to **Active** before API runs will behave like a live agent.

Why it beats `competitive_intel`: that agent's prompt is about SEO metrics (domain rating, backlinks).
A purpose-built agent gets a prompt that says "return this JSON", needs **no tools** (we send the page
text in `inputs.page_text`), and should have HITL thresholds off so runs come back `completed`, not
`hitl_triggered`.

Description to paste (edit freely):

> A marketing intake analyst for early-stage software products. Input: a product URL, the builder's
> own description, the page title, the landing-page text, a task string and an `output_schema` JSON
> template. Job: work out what the product is, who it is for, what drives those people, where they
> already gather online (real, named, active subreddits, Discords, forums, newsletters), its
> competitive position and the right voice. Output: ONLY a JSON object matching `output_schema`
> exactly, no prose, no markdown fence. Every string under 25 words, every array at most 4 items, no
> empty strings. Put the dot-paths of fields you guessed (not read from the page or description) in
> `inferred`. Needs no external tools or connectors; never post anywhere; no human approval required.

After it is Active, find its **type slug** (Agents list or `GET /api/v1/agents` → `type`) and paste it
into the app's Labs panel "Agent type slug" field, or run `node tools/ao-probe.mjs <url> --agent <slug>`.

If `/a2a/tasks` rejects a custom type (only built-ins are A2A skills), the fallback is running by UUID
(`POST /api/v1/agents/{uuid}/run`); the stock MCP server has no tool for that, so a ~60-line local MCP
server would be needed. Verify with the probe first.
