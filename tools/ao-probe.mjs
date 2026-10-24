#!/usr/bin/env node
/**
 * AgenticOrg probe — run the company/URL analysis through an AgenticOrg agent from the terminal,
 * before (or without) wiring it into the artifact. No dependencies, Node 18+.
 *
 *   export AGENTICORG_API_KEY=ao_sk_...
 *   node tools/ao-probe.mjs --whoami                      # find your company UUID
 *   export AGENTICORG_COMPANY_ID=<uuid>
 *   node tools/ao-probe.mjs https://yourproduct.com "what it does"   [--agent competitive_intel | --agent <agent-uuid>] [--raw] [--no-fetch]
 *
 * Optional: AGENTICORG_BASE_URL (default https://app.agenticorg.ai), AGENTICORG_AGENT (default competitive_intel)
 * Sends the same `inputs` the app sends, so what you see here is what the artifact will get.
 */
const BASE = (process.env.AGENTICORG_BASE_URL || "https://app.agenticorg.ai").replace(/\/$/, "");
const KEY = process.env.AGENTICORG_API_KEY || "";
const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(n); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, (v && !v.startsWith("--")) ? 2 : 1); return v && !v.startsWith("--") ? v : true; };
const AGENT = flag("--agent") || process.env.AGENTICORG_AGENT || "competitive_intel";
const ACTION = flag("--action") || "analyze";
const RAW = !!flag("--raw");
const NOFETCH = !!flag("--no-fetch");
const WHOAMI = !!flag("--whoami");
const COMPANY = flag("--company") || process.env.AGENTICORG_COMPANY_ID || "";

const DNA_SHAPE = `{
"identity":{"name":"","oneLiner":"","category":"","productType":"","platforms":[],"stage":"","pricingModel":""},
"what":{"valueProp":"","features":[],"jobToBeDone":"","useCase":"","proofAssets":[]},
"who":{"primaryPersona":"","secondaryPersona":"","ageRange":"","genderSkew":"","geography":"","techSavviness":"","spendingPower":""},
"drivers":{"motivation":"","pain":"","triggerMoment":"","topObjection":"","statusQuo":""},
"where":{"platforms":[],"communities":[],"mediaAndCreators":[],"searchTerms":[]},
"position":{"directCompetitors":[],"indirectAlternatives":[],"differentiator":"","positioningRisk":""},
"voice":{"tone":"","wordsToUse":[],"wordsToAvoid":[],"goal90d":"","hoursPerWeek":"","budget":"","existingAudience":""},
"inferred":[]
}`;
const TASK = "Analyse this early-stage product for a marketing intake. Work out what it is, who it is for, what drives those people, where they already gather online, its competitive position and the right voice. Return ONLY a JSON object in the exact shape given in output_schema, no prose. Every string under 25 words, every array at most 4 items, no empty strings. Communities must be real, named, active places. List the dot-paths of fields you guessed in inferred.";

if (!KEY) { console.error("Set AGENTICORG_API_KEY first."); process.exit(2); }
const H = { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` };

async function api(method, path, body) {
  const r = await fetch(BASE + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { ok: r.ok, status: r.status, json, text };
}

async function whoami() {
  for (const p of ["/api/v1/auth/me", "/api/v1/companies", "/api/v1/agents?limit=3"]) {
    const r = await api("GET", p);
    console.log(`\n== GET ${p} -> ${r.status}`);
    console.log(r.json ? JSON.stringify(r.json, null, 2).slice(0, 2500) : r.text.slice(0, 600));
  }
  console.log("\nLook for a company / org UUID above. Put it in AGENTICORG_COMPANY_ID (and in the app's Labs panel).");
}

function stripHtml(html) {
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const d = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  let body = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<\/(p|div|section|h[1-6]|li|tr|br)>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  return { title: t ? t[1].trim() : "", description: d ? d[1] : "", text: body.slice(0, 9000) };
}

function looksDna(d) { return !!(d && typeof d === "object" && d.identity && typeof d.identity === "object" && (d.what || d.who)); }
function jsonIn(s) {
  s = String(s || ""); try { return JSON.parse(s); } catch {}
  const m = s.match(/```(?:json)?\s*([\s\S]*?)```/); if (m) { try { return JSON.parse(m[1]); } catch {} }
  const a = s.indexOf("{"), b = s.lastIndexOf("}"); if (a >= 0 && b > a) { try { return JSON.parse(s.slice(a, b + 1)); } catch {} }
  return null;
}
function extractDna(out) {
  if (looksDna(out)) return out;
  if (typeof out === "string") { const d = jsonIn(out); return looksDna(d) ? d : null; }
  if (!out || typeof out !== "object") return null;
  for (const k of ["result", "data", "analysis", "profile", "dna", "json", "output", "content", "response", "answer", "text", "message", "summary", ...Object.keys(out)]) {
    const v = out[k]; if (v === undefined) continue;
    if (looksDna(v)) return v;
    if (typeof v === "string") { const d = jsonIn(v); if (looksDna(d)) return d; }
  }
  return null;
}

async function main() {
  if (WHOAMI) return whoami();
  const url = argv[0], description = argv[1] || "";
  if (!url) { console.error("Usage: node tools/ao-probe.mjs <url> [\"description\"] [--agent competitive_intel] [--raw] [--no-fetch] | --whoami"); process.exit(2); }
  if (!COMPANY && !/^[0-9a-f-]{36}$/i.test(AGENT)) { console.error("Set AGENTICORG_COMPANY_ID (run --whoami to find it), or pass --agent <agent-uuid>."); process.exit(2); }

  let page = { title: "", description: "", text: "" };
  if (!NOFETCH) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 SocialIntel-probe" }, redirect: "follow" });
      page = stripHtml(await r.text());
      console.log(`Fetched ${url}: ${r.status}, title "${page.title}", ${page.text.length} chars of text`);
    } catch (e) { console.log(`Could not fetch ${url}: ${e.message} (continuing with URL + description only)`); }
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(AGENT);
  const inputs = { url, description, page_title: page.title, page_text: page.text, task: TASK, output_schema: DNA_SHAPE };
  const path = isUuid ? `/api/v1/agents/${AGENT}/run` : "/api/v1/a2a/tasks";
  const body = isUuid
    ? { action: ACTION, inputs, context: { company_id: COMPANY }, company_id: COMPANY }
    : { agent_type: AGENT, company_id: COMPANY, action: ACTION, inputs, context: { company_id: COMPANY } };
  console.log(`\nPOST ${BASE}${path}  agent=${AGENT} (${isUuid ? "by id" : "by type"}) action=${ACTION} company=${COMPANY.slice(0, 8)}…`);
  const t0 = Date.now();
  const r = await api("POST", path, body);
  const ms = Date.now() - t0;
  const outPath = new URL("./ao-last-run.json", import.meta.url).pathname;
  await import("node:fs").then(fs => fs.writeFileSync(outPath, JSON.stringify({ request: { ...body, inputs: { ...body.inputs, page_text: `[${page.text.length} chars]` } }, status: r.status, ms, response: r.json ?? r.text }, null, 2)));

  if (!r.ok) { console.error(`\nHTTP ${r.status} after ${ms}ms:\n${r.text.slice(0, 1200)}\nSaved to ${outPath}`); process.exit(1); }
  const o = r.json || {};
  const out = "output" in o ? (o.output ?? {}) : (o.result?.output ?? {});
  const conf = "confidence" in o ? Number(o.confidence || 0) : Number(o.result?.confidence || 0);
  console.log(`\nrun_id      ${o.run_id || o.task_id || o.id || "?"}`);
  console.log(`status      ${o.status}   confidence ${conf}   runtime ${o.runtime || "?"}   ${ms}ms client / ${o.performance?.total_latency_ms ?? "?"}ms server`);
  console.log(`tool_calls  ${(o.tool_calls || []).length}  ${(o.tool_calls || []).map(t => t.tool).join(", ")}`);
  if (o.error) console.log(`error       ${o.error}`);
  if (o.hitl_trigger) console.log(`hitl        ${o.hitl_trigger}`);
  if ((o.reasoning_trace || []).length) console.log(`trace       ${o.reasoning_trace.slice(0, 6).join(" | ").slice(0, 600)}`);
  console.log(`output keys ${typeof out === "object" ? Object.keys(out).join(", ") : typeof out}`);

  const dna = extractDna(out);
  console.log(`\nVERDICT: ${dna ? "USABLE — output parses into the product-profile shape; the app will use it directly." : "NOT IN SHAPE — the app would pass this output to Claude as evidence and let Claude write the profile."}`);
  if (dna && !RAW) {
    console.log("\n" + JSON.stringify(dna, null, 2).slice(0, 4000));
  } else {
    console.log("\n--- raw output ---\n" + (typeof out === "string" ? out : JSON.stringify(out, null, 2)).slice(0, RAW ? 20000 : 3000));
  }
  console.log(`\nFull response saved to ${outPath}`);
}
main().catch(e => { console.error(e); process.exit(1); });
