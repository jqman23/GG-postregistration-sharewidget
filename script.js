// ─── GG Post-Registration Share Widget ─────────────────────────────────────────
// Encourages registrants to share their participation in the 2026 Global Gathering
// for the Future of Child Welfare on LinkedIn.

const EVENT_NAME  = "2026 Global Gathering for the Future of Child Welfare";
const EVENT_URL   = "https://www.futureofchildwelfare.org";
const IMAGE_URL   = "https://custom.cvent.com/AE944F71438646268B70FF5BF3772347/files/event/e7d15afcf2b14901ab0272ce8a401899/740c035fd1634b60a306eced16e0e25a.png";
const HASHTAGS    = "#FutureOfChildWelfare #ChildWelfare #SocialWork";

const SVG_LINKEDIN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';

// Pre-written LinkedIn caption. LinkedIn's share URL can't pre-fill post body
// text or attach an image, so we let the registrant copy the caption and download
// the graphic, then open LinkedIn's composer to paste + upload.
const POST_TEXT =
  `I'm proud to be joining the ${EVENT_NAME}! 🌍\n\n` +
  `This global event brings together advocates, practitioners, and leaders shaping the future of child welfare. ` +
  `I'm looking forward to the connections, learning, and conversations ahead.\n\n` +
  `Learn more: ${EVENT_URL}\n\n` +
  HASHTAGS;

// ─── Download the shareable graphic ────────────────────────────────────────────
async function downloadImage() {
  try {
    const res  = await fetch(IMAGE_URL, { mode: "cors" });
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    triggerDownload(url, "global-gathering-im-attending.png");
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  } catch (e) {
    // Fallback: open the image in a new tab so the user can save it manually.
    window.open(IMAGE_URL, "_blank", "noopener");
  }
}

function triggerDownload(href, filename) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── LinkedIn share modal ──────────────────────────────────────────────────────
function openShareModal() {
  requestParentMetrics();

  const overlay = document.createElement("div");
  overlay.className = "li-modal-overlay";
  overlay.innerHTML = `
    <div class="li-modal" role="dialog" aria-modal="true" aria-label="Share on LinkedIn">
      <div class="li-modal-header">
        ${SVG_LINKEDIN}
        Share on LinkedIn
      </div>
      <ol class="li-modal-steps">
        <li>Download the graphic (we'll grab it for you).</li>
        <li>Copy the caption below.</li>
        <li>Open LinkedIn, paste the caption, and attach the graphic.</li>
      </ol>
      <textarea id="li-post-text" spellcheck="false"></textarea>
      <div class="li-modal-actions">
        <button class="li-modal-close" id="li-close-btn">Cancel</button>
        <button class="li-modal-copy" id="li-copy-btn">Copy caption</button>
        <button class="li-modal-open" id="li-open-btn">
          ${SVG_LINKEDIN}
          Download &amp; open LinkedIn
        </button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const ta       = overlay.querySelector("#li-post-text");
  const copyBtn  = overlay.querySelector("#li-copy-btn");
  const openBtn  = overlay.querySelector("#li-open-btn");
  const closeBtn = overlay.querySelector("#li-close-btn");
  ta.value = POST_TEXT; // set via value so special chars stay safe

  const doClose = () => {
    try { document.body.removeChild(overlay); } catch (e) {}
    document.removeEventListener("keydown", onKey);
  };
  const onKey = e => { if (e.key === "Escape") doClose(); };
  document.addEventListener("keydown", onKey);
  overlay.addEventListener("click", e => { if (e.target === overlay) doClose(); });
  closeBtn.addEventListener("click", doClose);

  const doCopy = () => {
    const text = ta.value;
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    copyBtn.textContent = "Copied!";
    copyBtn.style.background  = "#e6f4ea";
    copyBtn.style.borderColor = "#2e7d32";
    copyBtn.style.color       = "#2e7d32";
    setTimeout(() => {
      copyBtn.textContent = "Copy caption";
      copyBtn.style.background = "";
      copyBtn.style.borderColor = "";
      copyBtn.style.color = "";
    }, 2000);
  };
  copyBtn.addEventListener("click", doCopy);

  openBtn.addEventListener("click", () => {
    doCopy();
    downloadImage();
    const liUrl = "https://www.linkedin.com/feed/?shareActive=true";
    setTimeout(() => window.open(liUrl, "_blank", "noopener,noreferrer"), 400);
  });
}

// ─── Interaction tracking ──────────────────────────────────────────────────────
// Matches the GG Partner Globe / FAQ / pricing widgets: a single GET to the shared
// Apps Script web app, fired once per browser session, with IP-based geo from
// ipapi.co. The Apps Script appends a row to the 2026Registration tab
// (timestamp, button, ip, country, state, city).
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxq8HofSFbnFxS7HeKQKZVhyuPIqpu_7NAWhvOzAXBzyxfatdeJu8hfGCRCahOINshA/exec";
const TRACK_KEY  = "ggPostRegShareTracked";

async function trackInteraction() {
  if (sessionStorage.getItem(TRACK_KEY)) return;
  sessionStorage.setItem(TRACK_KEY, "1");

  const params = new URLSearchParams({
    sheet:  "2026Registration",
    button: "PostRegShareWidget"
  });

  try {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const geo   = await fetch("https://ipapi.co/json/", { signal: ctrl.signal }).then(r => r.json());
    clearTimeout(timer);
    if (geo.ip)           params.set("ip",      geo.ip);
    if (geo.country_name) params.set("country", geo.country_name);
    if (geo.region)       params.set("state",   geo.region);
    if (geo.city)         params.set("city",    geo.city);
  } catch (_) {}

  fetch(SCRIPT_URL + "?" + params.toString(), { mode: "no-cors" }).catch(() => {});
}

// ─── Cvent iframe auto-resize ──────────────────────────────────────────────────
// Tell the parent Cvent page how tall the widget is so the iframe can grow.
function sendHeight() {
  const h = document.getElementById("shareWidget").getBoundingClientRect().height + 20;
  try { window.parent.postMessage({ ggWidgetHeight: Math.ceil(h) }, "*"); } catch (e) {}
}
function requestParentMetrics() {
  try { window.parent.postMessage({ ggRequestMetrics: true }, "*"); } catch (e) {}
}

// ─── Wire up ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("shareBtn").addEventListener("click", e => { e.preventDefault(); openShareModal(); });
  document.getElementById("downloadBtn").addEventListener("click", e => { e.preventDefault(); downloadImage(); });

  // Log engagement once per session on the first real interaction (any button,
  // including the Canva link).
  document.addEventListener("pointerdown", trackInteraction, { once: true });

  sendHeight();
  const img = document.getElementById("shareImage");
  if (img && !img.complete) img.addEventListener("load", sendHeight);
  window.addEventListener("resize", sendHeight);
});
