# Plug — PRD v1 (MVP)

**Status:** Draft for review · **Date:** 2026-10-24 · **Owner:** Ijas
**Deadline driver:** VC pitch tomorrow. MVP must be demo-able and usable by real friends.

---

## 1. Problem

AI coding collapsed the cost of building. It did not collapse the cost of distribution.

Builders ship a product, then stall. They ask a chatbot "how do I market this?" and get a channel name. The channel is often right. The **post type is wrong**, and that is the part that kills them.

**Founding evidence (real, lived):** A Letterboxd-for-video-games mobile app. Chatbot said Reddit, named the subreddit — correct. Builder posted *"I made an app like this, looking for early users."* Dead. One week later, re-posted as *a screenshot + "what app do you guys use to rate your games?"* → traction, comments, "what app is this?" The channel was never the problem. The **format, framing, and community norm** were.

That week of trial-and-error is the product.

**Secondary gap:** builders have no trend awareness. When GTA 6 drops an art style, every brand rides it within 48h. Indie builders never see the wave.

## 2. What Plug is

> An AI marketing operator for early-stage products. Drop a link. Get a marketing plan that knows the rules of every room you're about to walk into.

**Not** a generic "write me a tweet" tool. The differentiator is **community-norm intelligence**: per-community rules, accepted post types, what gets removed, and a draft written *in that shape*.

## 3. Users

| | |
|---|---|
| **Primary** | Vibecoders / solo devs / indie hackers with a shipped or near-shipped digital product |
| **Stage** | Pre-launch → launch week → long tail, up to first 1,000 users |
| **Marketing skill** | Low to none. Has never run a campaign. |
| **Budget** | ~$0. Organic only. Time-poor. |
| **Emotional state** | Built something good, nobody is looking, mildly ashamed to self-promote |

**Non-users in V1:** agencies, funded marketing teams, e-commerce brands, personal-brand creators.

## 4. Core value props (ranked)

1. **Post-type intelligence** — knows what shape of post works in each specific community, writes the draft in that shape.
2. **Precision targeting** — not "use Reddit" but "r/iosgaming, 180k, no-self-promo Tuesdays, screenshot-first posts win."
3. **Compression** — one week of flailing → 60 seconds.
4. **Trend angles** — cultural hooks in the product's niche to piggyback.
5. **Sequence** — a week-by-week plan, not a pile of ideas.

## 5. Scope

### In scope — V1 (working)
- Intake (URL + optional description)
- Firecrawl fetch of the URL → fallback to manual detail entry on failure
- AI analysis → **Product DNA** review page, fully editable
- Marketing Dashboard: channel map, community picks, content kit, trend angles, launch sequence, progress tracking
- "Open & post" deep links (prefilled compose screens) + mark-as-posted
- localStorage persistence, multi-project, no accounts

### Visible but locked — V2 (shown with preview, "Coming soon")
Auto-post agent · Analytics & attribution · Live trend radar · Competitor analysis · Social media audit · Brand guidelines generator · Content calendar · Creator/influencer finder · SEO engine · Paid ads planner · Connect accounts · Plans & billing

Locked modules are **not** dead links. Each opens a styled preview of the real thing with a "Coming in V2" ribbon. They do pitch work and they do retention work.

### Explicitly out of scope — V1
Automated posting · real account OAuth · real analytics data · server-side anything · payments · collaboration/teams

## 6. The flow

```
[1 Intake] → [2 Analyzing] → [3 Product DNA (editable)] → [4 Marketing Dashboard]
                                                               ├── Social Media Marketing  ← the one we push
                                                               └── Locked V2 modules (sidebar)
```

### Screen 1 — Intake

**Goal:** lowest possible friction to first value. One field is enough.

- **Product URL** (primary, required-ish)
- **Brief description** (optional, expandable textarea)
- Primary CTA: **Analyse my product**
- Secondary: "No link yet? Describe it instead" → swaps URL for a description-first mode
- Below the fold, dimmed: the five things they're about to get (channel map, community picks, ready drafts, trend angles, launch plan)

**Psychology:** single-field start beats a form. Showing the payoff under the fold sets expectation without taxing working memory.

### Screen 2 — Analyzing

**Goal:** make the work visible. This screen is where perceived value is manufactured.

Staged, honest progress — each stage lights up as it actually happens:

1. Reading your product page *(Firecrawl)*
2. Understanding what you've built
3. Profiling who it's for
4. Mapping where they gather
5. Learning each community's rules
6. Drafting your first posts

Live ticker of what was found ("Found: iOS app · game tracking · social logging"). Minimum 1.2s per stage even if faster — **labor illusion**: visible effort raises perceived quality and trust. Never a bare spinner.

**Failure path:** Firecrawl fails or returns thin content → stage 1 flips to a calm amber state: *"Couldn't read that page. Tell me a bit about it instead."* → inline form (what it does, who it's for, platform) → resume. No dead end, no error page, no lost input.

### Screen 3 — Product DNA (editable review)

**Goal:** correctness + ownership. The AI's understanding, laid out in grouped, editable cards.

This screen exists for two reasons. One: the AI *will* get things wrong, and a wrong audience poisons every downstream recommendation. Two: **the IKEA effect** — a user who edits even one field owns the output and trusts the rest.

Each field carries a **source badge**:
- `From your site` (Firecrawl-extracted, high confidence)
- `You told us` (user-supplied)
- `AI inferred` (guessed — amber, nudges review)

Fields that are inferred and high-leverage get an explicit *"Does this look right?"* prompt.

**Card groups:**

**A. Identity**
Product name · One-liner · URL · Category / industry · Product type (mobile app, web app, SaaS, game, dev tool, extension, marketplace, API) · Platforms · Stage · Pricing model

**B. What it does**
Core value proposition · Top 3 features · Primary job-to-be-done · Core use case · Proof assets available (screenshots / demo video / live metrics)

**C. Who it's for**
Primary persona (one line) · Secondary persona · Age range · Gender skew · Geography · Tech savviness · Spending power

**D. What drives them** *(psychographics — the field most tools skip, and the one that decides post framing)*
Core motivation · Pain being solved · Trigger moment (when they go looking) · Top objection · What they use today (status quo / alternatives)

**E. Where they already are**
Platforms they live on · Communities · Media & creators they follow · Search terms they use

**F. Competitive position**
Direct competitors · Indirect alternatives · Differentiator ("why switch") · Positioning risk

**G. Voice & constraints**
Brand tone · Words to use · Words to avoid · Goal for next 90 days (waitlist / installs / feedback / revenue) · Hours per week available · Budget · Existing audience size

Every field inline-editable. Add/remove list items. Changes persist. "Re-analyse with my edits" regenerates downstream if DNA changes materially.

Primary CTA: **Begin marketing →**

### Screen 4 — Marketing Dashboard

Persistent left sidebar. Main area = the active module.

**Sidebar:**
- Product switcher (top) — avatar + name, dropdown of saved projects, "+ New product"
- **Social Media Marketing** ← default, active, visually dominant
- Locked modules below a divider, each with a lock glyph and a soft label: Competitor Analysis · Social Media Audit · Brand Guidelines · Content Calendar · Live Trend Radar · Auto-Post Agent · Analytics · Creator Finder · SEO Engine · Paid Ads · Connect Accounts · Plans
- Bottom: progress ring — "3 of 12 posts shipped"

#### Module 1 — Social Media Marketing (the product)

Five sections, in intentional order. Each answers the next question the user has.

**1. Positioning brief** *(so you say the right thing everywhere)*
- Your one-liner, rewritten for strangers
- Audience summary in one sentence
- **Say this / Never say this** — two columns, concrete. This is the Reddit lesson, generalized and up top.

**2. Channel map** *(where to spend your effort)*
All channels in scope, each scored 0–100 on fit, with: why this score · effort level · time-to-first-result · audience-match reason.
Split into **Start here** (top 3–5) and **Later** (collapsed). Default-collapsing "Later" prevents paralysis; ranking is the whole point.

**3. Community picks** *(the exact rooms)*
Per community card:
- Name, size, link
- Who's in here
- **Self-promo policy** — green/amber/red badge
- **What works here** — the accepted post types, with examples
- **What gets removed** — the trap list
- Recommended post type for *this* product
- Best day/time to post
- ⚠️ *"Verify rules before posting — communities change."*

**4. Content kit** *(what to actually say)*
One draft per recommended community, written in that community's accepted shape — ask-the-community for a gaming sub, Show HN for Hacker News, tagline + maker's first comment for Product Hunt, hook-thread for X, story-post for LinkedIn, etc.

Each draft card:
- Platform badge + target community
- Post type label ("Soft-launch question post")
- Title/hook + body, in a realistic preview frame
- **Why this works here** — one line of reasoning (teaches, doesn't just deliver)
- Actions: **Copy** · **Regenerate** · **Open & post** (deep link, prefilled compose) · **Mark as posted** checkbox

Deep links keep it 100% manual — zero automation, zero ban risk — while feeling like one click.

**5. Launch sequence** *(what to do, in what order)*
Week-by-week timeline through first 1,000 users: Week 0 seed & lurk → Week 1 launch day → Week 2 follow-ups → Week 3–4 compounding. Each step is a checkbox tied to a draft. Checking items fills the sidebar progress ring.

**6. Trend angles**
3–5 cultural hooks in the product's niche, each with an angle + suggested format. Below them, the locked **Live Trend Radar** card: *"Real-time trend detection across your niche — coming in V2."*

#### Locked modules
Each renders a blurred/static but *beautiful* preview of the real feature, a one-line promise, and "Coming in V2 · Notify me" (stores interest locally; doubles as demand signal to quote in the pitch).

## 7. UX principles (non-negotiable)

| Principle | Applied as |
|---|---|
| One primary action per screen | Never two equal-weight CTAs |
| Labor illusion | Staged analysis screen, honest per-stage reveals |
| IKEA effect | Editable DNA page → ownership → trust in output |
| Progressive disclosure | "Later" channels collapsed, DNA cards collapsible, drafts expand |
| Goal gradient | Progress ring + launch checklist pull toward completion |
| Zeigarnik effect | Unfinished checklist is the reason to come back tomorrow |
| Loss aversion | Locked modules show what's missing, tastefully |
| Teach, don't just tell | Every recommendation carries a one-line "why" |
| Honest AI | Source badges, confidence states, "verify before posting" warnings |
| No dead ends | Every failure path offers the next action |

## 8. Technical approach

- **Single published Artifact** (HTML). No build step, no server.
- **Generation:** Claude called from the page at view time, structured JSON output per stage. Staged calls (DNA first, then dashboard) so screen 3 appears fast and screen 4 generates while the user reviews.
- **Fetch:** Firecrawl via the viewer's connection. Known limit: works for the owner/workspace, not for guests on a shared link → guests take the manual fallback. Acceptable; the fallback is a first-class path. V2 moves it server-side.
- **Persistence:** localStorage. Multi-project. Wrapped in try/catch — must render correctly with zero stored state.
- **Resilience:** JSON parse failures retry once, then degrade to a partial dashboard rather than an error.
- **Theming:** light + dark, token-driven.
- **Responsive:** works on a laptop on a pitch screen and on a phone when a friend opens the link.

## 9. Success criteria

**For the pitch (tomorrow):** a live product URL typed in cold produces a dashboard a marketer would not be embarrassed by, in under 60 seconds, without a crash.

**For the MVP (friends):**
- ≥70% of users reach the dashboard without abandoning
- ≥1 draft copied or posted per user
- Qualitative: "this told me something I didn't know" ← the only one that matters

## 10. Risks

| Risk | Mitigation |
|---|---|
| **Hallucinated communities/rules** — AI invents a subreddit or misstates its policy | Link out to every community so it's one click to verify · explicit verify-before-posting warning · prefer large, well-known communities |
| Generation latency on stage | Staged generation, DNA screen appears early, analysis screen makes the wait feel earned |
| Firecrawl unavailable for guests | Manual fallback is a designed path, not an error |
| Generic output | DNA page forces specificity; prompts demand post-type reasoning, not generic advice |
| Output quality variance | Regenerate on every draft; structured schemas constrain shape |

## 11. Open decisions

1. **Regenerate scope** — regenerate a single draft only, or offer "regenerate this whole section"?
2. **Edit-then-regenerate** — if the user edits the DNA audience after the dashboard is built, auto-regenerate or prompt?
3. **Draft count** — how many communities to draft for by default? Proposed: top 5, with "generate more" per channel.
4. **Locked-module depth** — static preview image-style mocks, or interactive-but-fake? Proposed: static, beautiful, fast to build.
5. **Onboarding** — zero-state for a first-time visitor: straight to intake, or one line of context first? Proposed: straight to intake.

## 12. Build order

1. Shell: routing, state, localStorage, theme, design system
2. Screen 1 intake
3. Firecrawl + Claude DNA generation, with fallback
4. Screen 2 analyzing
5. Screen 3 Product DNA, editable
6. Screen 4 shell + sidebar
7. Social Media Marketing module, all six sections
8. Deep links, copy, mark-as-posted, progress
9. Locked module previews
10. Polish: dark mode, responsive, empty/error states
11. Seeded example (last, if time)
