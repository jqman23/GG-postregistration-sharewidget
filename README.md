# GG Post-Registration Share Widget

A lightweight, brand-aligned widget for the **post-registration confirmation page**
of the 2026 Global Gathering for the Future of Child Welfare. It gives new
registrants a simple way to celebrate and share their participation on LinkedIn.

## What it does

- Shows the shareable "I'm attending" graphic.
- **Share on LinkedIn** — opens a guided modal with a pre-written, editable caption.
  The registrant copies the caption, the graphic auto-downloads, and LinkedIn's
  composer opens so they can paste and attach.
- **Download image** — saves the PNG locally.
- **Customize in Canva** — opens the editable Canva template so registrants can
  personalize the graphic before posting.

LinkedIn's public share URL can't pre-fill post text or attach an image, so the
flow is intentionally "copy caption + download graphic + open composer."

## Tracking

Uses the same mechanism as the other GG widgets (Partner Globe, FAQ, pricing): a
single GET to the shared Google Apps Script web app on the first interaction per
browser session, with IP-based geo from ipapi.co. The script appends a row to the
`2026Registration` tab (timestamp, button, ip, country, state, city). This
widget's button label is **`PostRegShareWidget`**.

## Assets

- Shareable graphic (PNG): hosted on Cvent's CDN (see `IMAGE_URL` in `script.js`).
- Editable Canva template: <https://canva.link/iovu17xx4ql9xv4>

## Files

| File | Purpose |
|------|---------|
| `index.html` | Widget markup |
| `styles.css` | Brand-aligned styling (Montserrat, navy `#122345`, sage `#bebe7b`, LinkedIn blue `#0A66C2`) |
| `script.js` | Share modal, image download, Cvent iframe auto-resize |
| `cvent-embed-snippet.html` | Iframe embed code for the Cvent confirmation page |
| `vercel.json` | Allows the page to be framed by Cvent |

## Deploy

Static site — deploy the root to Vercel (or any static host). Then paste
`cvent-embed-snippet.html` into a Custom HTML block on the Cvent
post-registration confirmation page, updating the `src` to your deployed URL.

## Local preview

Open `index.html` directly, or serve the folder:

```bash
npx serve .
```
