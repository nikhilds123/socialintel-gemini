# Plan: make the result overview hook on first reveal

Target file: `app.html` (single-file app). Work in place. Keep everything backward compatible with projects already saved in localStorage (fields may be missing on old plans; render gracefully).

## Why

At the moment the plan is revealed, the overview shows two zeros (0/5 posts shipped, 0/13 steps), a prep task as the hero, and a painting in the most valuable space. The findings people came for (where their users are, which channel first) are in the 4th tab. Rework the first frame so it answers "where do my users already hang out, and what do I do first" before it scores progress.

## Do not touch

- `viewIntake`, `viewLanding`, `viewAnalyzing`, `dnaPrompt`, the DNA/profile screens (`viewDna`, `dnaBody`, `railInner`, `dockInner`).
- `tabRooms`, `tabDrafts`, `composer`, `tabPlan`, `tabTrends`. They are good.
- The generation pipeline (`runSample`, `generateDna`, `generatePlan`, `startPlan`) except the two additive prompt changes in step 7.
- Visual language: keep the existing CSS tokens, type scale, `.wcard`, `.meter`, `.pill`, `.pchip` patterns. Reuse, don't invent.

## Steps

Do them in order. After each step, open the app with "Load example product" (`loadExample`, project "Replay") and confirm the overview renders without console errors.

### 1. Rename the workspace header (`smmHead`)

- Crumbs: `Drape / Where it belongs` (replace the literal "Social Media Marketing" in both the crumb `<b>` and the `<h1>`).
- `<h1>`: `Where {prodName(p)} belongs`.
- Subtitle `<p>` when a plan exists: `{N} rooms · {reach} people already talk about this · first result in {timeToResult of top channel}`.
  - `N` = `arr(pl.communities).length`
  - `reach` = `fmtReach(sumReach(pl.communities))` (helpers in step 2)
  - top channel = `arr(pl.channels).slice().sort(byScore)[0]`; use its `timeToResult`, fall back to omitting that clause.
- Keep the "Product profile" button.
- Sidebar nav label (`viewDashboard`): change the item text "Social Media Marketing" to "Where it belongs". Keep `data-mod="smm"`.

### 2. Add reach helpers (near `score`/`byScore`)

```js
function parseSize(s){            // "410k members" -> 410000, "~8k" -> 8000, "1.2M" -> 1200000, "High variance" -> 0
  var m = /([\d.,]+)\s*([kKmM])?/.exec(txt(s)); if(!m) return 0;
  var n = parseFloat(m[1].replace(/,/g,"")); if(!isFinite(n)) return 0;
  var u = (m[2]||"").toLowerCase(); return Math.round(u==="m" ? n*1e6 : u==="k" ? n*1e3 : n);
}
function sumReach(cm){ return arr(cm).reduce(function(a,c){ return a+parseSize(c.size); }, 0); }
function fmtReach(n){ if(n>=1e6) return "~"+(n/1e6).toFixed(n>=1e7?0:1)+"M"; if(n>=1e3) return "~"+Math.round(n/1e3)+"k"; return n ? String(n) : "—"; }
```

If `sumReach` returns 0 (sizes unparseable), omit the reach clause everywhere rather than printing "0".

### 3. Rebuild the hero in `tabOverview`

Replace the current `section.hero2` block. New layout: two columns, left 3fr / right 2fr (reuse the `.g2` grid or add `.hero3{display:grid;grid-template-columns:3fr 2fr;gap:16px}`; stack to one column under 900px).

**Left card — "Where your first 1,000 come from"**
- Header: title + muted right label `fit · first result`.
- Rows: the start set (`startSet(pl)`, top 4) plus the single next channel from the rest, rendered dimmed, so the cut-off is visible.
- Each row: channel name · `.meter` bar at `score(c)`% · score number · `timeToResult` (muted, right-aligned). Reuse the `.fitrow` markup from the existing "Channel fit" card and extend it with the time column.
- Footer link: `Top {n} start now · {rest} more in Channels` → `data-tab="channels"`.
- **Stacked-bar variant (only if step 7 has shipped and channels carry `expectedInstalls`)**: above the rows, one horizontal stacked bar where each start-set channel's segment width = midpoint of `expectedInstalls` / 1000, capped so the total never exceeds 100%. Caption: `Estimate from community size and post type. Midpoints, not best case.` Fall back to the rows-only version when any start-set channel lacks the field.

**Right card — "First move"**
- Eyebrow: `First move · {c.bestTime}` (accent color) where `ns` is `nextStep(p)` and `c` is the room of its draft; if `ns` has no draft, show `First move · {w.week}`.
- Title: `ns.st.text` (the existing h2 text), at `h3` size, not display size.
- Line under it: `{d.postType} · {policyShort(c.promoPolicy)}` using existing helpers.
- Buttons: keep `data-godraft` ("Review and post") and `data-stepdone` ("I already posted it"). Keep the "All done" branch when `ns` is null.
- Remove `paint("alps", 11)` from the overview. Do not delete `paint`; the intake/analyzing/locked screens still use it.
- Remove `postCard` / `weekCard` from the hero (they duplicated "This week").

### 4. Stats row: readiness first, progress after the first post

Replace the four `.stat` tiles with a function `overviewStats(p)`:

- If `postedCount(p) === 0` (nothing shipped yet):
  1. `Reachable audience` → `fmtReach(sumReach(cm))`, sub `{cm.length} rooms · {open} welcome self-promo`
  2. `Best channel` → `top.name`, sub `{score(top)} fit · {top.effort} effort`
  3. `First result` → `top.timeToResult`, sub `if you post this week`
  4. `Ready to post` → `{drafts.length}` with small `drafts`, sub `{steps.length} steps planned`
- Else (something shipped): keep the current four tiles (`Posts shipped`, `Launch progress` with `.wkbar`, `Rooms mapped`, `Best channel`).

Same `.stats` / `.stat` CSS. No new tile styles.

### 5. Rooms list on the overview

Directly under the stats, add a card "Rooms, ranked" (reuse `.wcard`):

- One row per community, ordered by the fit score of its platform's channel (match `platInfo(c.platform).n` to a channel name; unmatched go last), then by `parseSize(c.size)` desc.
- Columns: `pchip(platInfo(c.platform))` · room name · size (`.num`, muted) · policy dot (`<span class="sdot {policyClass(c.promoPolicy)[0]}">`, same as `tabRooms`) · `recommendedPostType`.
- Row click: `S.roomSel = c.id; S.tab = "rooms"; render();` (same effect as the `data-room` handler in `tabRooms`; reuse that handler if it is delegated).
- Footer legend: `Dot: self-promo open · with conditions · banned`.

Remove the old "Channel fit" card from the overview (its content now lives in the hero) and remove the "This week" card (duplicate of the hero). Keep "Positioning".

Overview order after this step: header → hero (chart + first move) → stats → rooms ranked → positioning.

### 6. Tabs and sidebar

- `SMM_TABS` order: `overview, channels, rooms, drafts, plan, trends`.
- `tabCount`: add `channels` → `startSet(pl).length` so the tab reads "Channels 4".
- Sidebar (`viewDashboard`): render the first 3 `LOCKED` items, then a `+{LOCKED.length-3} more` button that toggles `S.lockedOpen` and shows the rest. Reorder `LOCKED` so the three that match the product promise come first: Auto-Post Agent, Analytics & Attribution, Live Trend Radar. Keep all existing ids so `viewLocked` and `lockedById` keep working.

### 7. Prompt changes (additive only)

In `PLAN_SHAPE`, extend the channel object:
```
{"name":"","score":0,"verdict":"start","why":"","effort":"","timeToResult":"","expectedInstalls":{"low":0,"high":0}}
```
In `planPrompt` rules:
- Add: `expectedInstalls: a realistic range of installs or signups from the first good post on this channel for a product at this stage. Be conservative; most posts are median, not viral.`
- Change `communities: exactly 5` → `communities: 6 to 8 real, specific, currently active places`. (Overview shows all; Rooms tab already handles any count.)

`loadExample`: add `expectedInstalls` to each of the example's channels (sensible numbers like `{low:20, high:80}` for Reddit, `{low:0, high:150}` for Hacker News, `{low:2, high:15}` for X) so the stacked-bar variant renders on the sample. The example should also have 6 communities; add one plausible real one (e.g. r/gamingsuggestions) with the full field set and a matching draft.

### 8. Guard rails

- Every new read of `expectedInstalls`, `timeToResult`, `size` must tolerate `undefined` (old saved plans).
- No new fonts, libraries or colors. If a new CSS rule is needed, add it next to the `.stats` rules and use existing tokens.
- Keep the `.disclaim` footer on every tab.

## Acceptance

1. Load the example: the overview's first frame has no zero in any tile; the `h1` reads "Where Replay belongs"; the hero shows the ranked channel chart and the first move; the painting is gone from the overview.
2. Mark one draft as posted from Drafts: the stats row switches to the progress tiles (`1 / N posts shipped`), and the sidebar meter updates.
3. Click a row in "Rooms, ranked": the Rooms tab opens with that room selected.
4. Tabs read `Overview · Channels 4 · Rooms N · Drafts N · Launch plan 0/13 · Trends`.
5. Sidebar shows 3 locked items and a "+8 more" toggle.
6. A project saved before this change (no `expectedInstalls`) still renders; the stacked bar is simply absent.
7. Run a real analysis on a URL: the overview populates from the generated plan; the subtitle reach number is present when sizes parse and absent (not "0") when they do not.
8. No console errors on any tab; phone width (400px) shows the hero as one column with no horizontal scroll.
