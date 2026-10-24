# SocialIntel (Gemini edition)

Static single-page app (`index.html`) served from GitHub Pages. All model calls go
straight from the browser to the Gemini API (Google AI Studio).

## Key setup
- **Deploy:** add repo secret `GEMINI_API_KEY` (Settings → Secrets → Actions). The Pages
  workflow writes it into `config.js`. Optional repo variable `GEMINI_MODEL`.
- **Local:** put the key in `.env`, then `./tools/dev.sh` and open http://localhost:8000.
- **No key configured:** visitors can paste their own key in the page; it stays in their browser.

> The deployed key is readable by anyone who opens the site. Restrict it in Google Cloud
> console → APIs & Services → Credentials: HTTP referrer `https://nikhilds123.github.io/*`,
> API restriction "Generative Language API", and set a quota cap.
