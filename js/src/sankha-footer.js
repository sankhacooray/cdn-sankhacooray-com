/* =========================================================================
   sankha-footer.js  ·  shared network footer for the sankhacooray.com family
   Hosted on cdn.sankhacooray.com — edit here once, every site updates.
   This is the readable SOURCE; run ./build.sh to regenerate the minified
   /js/sankha-footer.js that pages load (commit both).

   Drop-in usage (anywhere near the end of <body>):

     <div id="scn-footer"></div>
     <script async src="https://cdn.sankhacooray.com/js/sankha-footer.js"
             data-site="vitals.sankhacooray.com"
             data-tagline="a personal metabolism journal"></script>

   It renders ONE short line (name · tagline · Network · social) with no
   divider; the full network map opens from the "Network" button in a
   full-screen frosted overlay.

   The footer AUTO-THEMES to the host page: it reads the page's rendered
   background, text and accent colours and derives its own palette, so it
   blends into any site with zero styling work. Override knobs (all optional):

     data-site      host this footer lives on → highlights "you are here"
     data-tagline   short line shown beside the copyright
     data-accent    pin the accent colour if auto-detection looks off
     data-mount     CSS selector of the mount element (default "#scn-footer";
                    falls back to appending to <body>)

   Fails soft: any error just means no footer — never a broken page.
   ========================================================================= */
(function () {
  "use strict";

  var ME = document.currentScript;

  // ----------------------------------------------------------------- config
  var SOCIAL = [
    ["LinkedIn", "https://www.linkedin.com/in/sankhacooray/", "M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.96-1.8-2.96-1.8 0-2.08 1.4-2.08 2.86V21H9z"],
    ["GitHub", "https://github.com/sankhacooray", "M12 2a10 10 0 00-3.16 19.5c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0012 2z"]
  ];

  // The whole network, grouped. Add a site here once → it appears everywhere.
  // NB: a project that belongs to a hub/lens is NOT listed individually here —
  // its hub surfaces it. Only hubs + standalone sites live in this footer.
  var GROUPS = [
    ["Hubs", [
      ["music", "music.sankhacooray.com"],
      ["learn", "learn.sankhacooray.com"],
      ["food", "food.sankhacooray.com"],
      ["city", "city.sankhacooray.com"],
      ["language", "language.sankhacooray.com"],
      ["design", "design.sankhacooray.com"],
      ["make", "make.sankhacooray.com"],
      ["craft", "craft.sankhacooray.com"],
      ["dev", "dev.sankhacooray.com"],
      ["access", "access.sankhacooray.com"],
      ["sense", "sense.sankhacooray.com"],
      ["biomed", "biomed.sankhacooray.com"],
      ["play", "play.sankhacooray.com"],
      ["travel", "travel.sankhacooray.com"]
    ]],
    ["Portfolio", [
      ["sankhacooray.com", "sankhacooray.com"],
      ["v2 · archive", "v2.sankhacooray.com"],
      ["v1 · legacy", "v1.sankhacooray.com"]
    ]],
    ["Health & self", [
      ["vitals", "vitals.sankhacooray.com"],
      ["date", "date.sankhacooray.com"]
    ]],
    ["Studio & labs", [
      ["pixels", "pixels.sankhacooray.com"]
    ]],
    ["Tools", [
      ["paynow", "paynow.sankhacooray.com"]
    ]]
  ];

  function data(name, def) {
    var v = ME && ME.getAttribute("data-" + name);
    return (v == null || v === "") ? def : v;
  }
  var HERE    = data("site", "");
  var TAGLINE = data("tagline", "");
  var PINNED  = data("accent", "");
  var MOUNTSEL = data("mount", "#scn-footer");

  // ------------------------------------------------------------ colour utils
  function parse(c) {
    var m = (c || "").match(/[\d.]+/g);
    if (!m) return [0, 0, 0, 0];
    return [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]];
  }
  function lum(rgb) { return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]; }
  function sat(rgb) {
    var mx = Math.max(rgb[0], rgb[1], rgb[2]), mn = Math.min(rgb[0], rgb[1], rgb[2]);
    return mx === 0 ? 0 : (mx - mn) / mx;
  }
  function mix(rgb, t, a) { return [0, 1, 2].map(function (i) { return Math.round(rgb[i] + (t[i] - rgb[i]) * a); }); }
  // WCAG relative luminance / contrast ratio, used to keep translucent text
  // tokens at >= 4.5:1 (AA) on the page background.
  function relLum(rgb) {
    var v = [0, 1, 2].map(function (i) {
      var c = rgb[i] / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function contrast(a, b) {
    var la = relLum(a), lb = relLum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  // Smallest alpha >= `a` at which fg over bg still reads at 4.6:1.
  function legibleAlpha(fg, bg, a) {
    for (; a < 1; a += 0.02) {
      if (contrast(mix(bg, fg, a), bg) >= 4.6) return Math.round(a * 100) / 100;
    }
    return 1;
  }
  function css(rgb, a) { return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + (a == null ? 1 : a) + ")"; }

  function colourFromValue(v) {           // resolve any CSS colour string → rgba[]
    var probe = document.createElement("span");
    probe.style.cssText = "color:" + v;
    document.body.appendChild(probe);
    var rgb = parse(getComputedStyle(probe).color);
    probe.remove();
    return rgb;
  }

  function detectAccent(fg) {
    if (PINNED) { var p = colourFromValue(PINNED); if (p[3] !== 0) return p; }
    // 1) probe common custom-property names
    var names = ["--accent", "--primary", "--brand", "--gold", "--accent-color",
                 "--color-accent", "--link", "--theme", "--highlight"];
    var roots = [document.documentElement, document.body];
    for (var r = 0; r < roots.length; r++) {
      var cs = getComputedStyle(roots[r]);
      for (var n = 0; n < names.length; n++) {
        var v = cs.getPropertyValue(names[n]).trim();
        if (v) { var rgb = colourFromValue(v); if (rgb[3] !== 0) return rgb; }
      }
    }
    // 2) sample link colours; pick the most saturated that isn't the body text
    var links = document.querySelectorAll("a"), best = null, bestSat = 0.12;
    for (var i = 0; i < links.length && i < 200; i++) {
      var lc = parse(getComputedStyle(links[i]).color);
      if (Math.abs(lum(lc) - lum(fg)) < 6 && sat(lc) < 0.1) continue;
      if (sat(lc) > bestSat) { bestSat = sat(lc); best = lc; }
    }
    if (best) return best;
    // 3) fall back to text colour
    return fg;
  }

  function detectTheme() {
    var body = getComputedStyle(document.body);
    var bg = parse(body.backgroundColor);
    if (bg[3] === 0) bg = parse(getComputedStyle(document.documentElement).backgroundColor);
    if (bg[3] === 0) bg = [14, 18, 10, 1];                 // sensible dark default
    var fg = parse(body.color);
    var dark = lum(bg) < 128;
    var acc = detectAccent(fg);
    var toward = dark ? [255, 255, 255] : [0, 0, 0];
    return {
      fg:      css(fg),
      surface: css(mix(bg, toward, dark ? 0.05 : 0.04)),
      line:    css(fg, 0.12),
      dim:     css(fg, legibleAlpha(fg, bg, 0.72)),
      muted:   css(fg, legibleAlpha(fg, bg, 0.45)),
      accent:  css(acc),
      accentSoft: css(acc, dark ? 0.16 : 0.10),
      chip:    css(fg, dark ? 0.07 : 0.05),
      glass:   css(bg, 0.62)
    };
  }

  // -------------------------------------------------------------- markup/css
  // One short line (ui-ux-style rules 7, 18): name · tagline on the left;
  // "Network" + social icons on the right. The full network map (hubs and
  // every other group, role, "part of the network") lives behind the Network
  // button in a full-screen frosted overlay, so the footer itself stays one
  // line with no divider. Colours come from the host page (see applyTheme),
  // falling back to currentColor so it reads in any theme.
  function svg(path, size) { size = size || 16; return '<svg viewBox="0 0 24 24" fill="currentColor" width="' + size + '" height="' + size + '" aria-hidden="true"><path d="' + path + '"/></svg>'; }
  var GRID_ICON = "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z";
  var CLOSE_ICON = "M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6z";
  var UID = "scn-net-" + Math.random().toString(36).slice(2, 8);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function socialHTML(size) {
    return SOCIAL.map(function (s) {
      return '<a href="' + s[1] + '" title="' + s[0] + '" aria-label="' + s[0] + '" target="_blank" rel="noopener">' + svg(s[2], size) + '</a>';
    }).join("");
  }

  function buildHTML() {
    var year = new Date().getFullYear();
    // TAGLINE is author-supplied markup (e.g. "&amp;"), kept as before.
    return '<div class="scn-inner scn-line">' +
        '<span class="scn-left"><span class="scn-name">© ' + year + ' Sankha Cooray</span>' +
        (TAGLINE ? '<span class="scn-tag"> · ' + TAGLINE + '</span>' : '') + '</span>' +
        '<span class="scn-right">' +
          '<button type="button" class="scn-netbtn" aria-haspopup="dialog" aria-expanded="false" aria-controls="' + UID + '" title="The sankhacooray.com network">' +
            svg(GRID_ICON, 13) + '<span>Network</span></button>' +
          '<span class="scn-social">' + socialHTML(15) + '</span>' +
        '</span></div>';
  }

  function buildOverlayHTML() {
    function link(it, cls) {
      var cur = it[1] === HERE;
      cls = (cls || "") + (cur ? " scn-here" : "");
      return '<a' + (cls.trim() ? ' class="' + cls.trim() + '"' : '') + (cur ? ' aria-current="page"' : '') +
             ' href="https://' + it[1] + '">' + esc(it[0]) + '</a>';
    }
    var hubs = GROUPS[0];
    var chips = hubs[1].map(function (it) { return link(it, "scn-chip"); }).join("");
    var cols = GROUPS.slice(1).map(function (g) {
      var items = g[1].map(function (it) { return '<li>' + link(it) + '</li>'; }).join("");
      return '<div class="scn-col"><h5>' + esc(g[0]) + '</h5><ul>' + items + '</ul></div>';
    }).join("");
    return '<div class="scn-panel">' +
        '<button type="button" class="scn-close" aria-label="Close">' + svg(CLOSE_ICON, 18) + '</button>' +
        '<div class="scn-head"><span class="scn-mark">SC</span><span>' +
          '<span class="scn-oname" id="' + UID + '-t">Sankha Cooray</span>' +
          '<span class="scn-role">Developer &amp; Innovator · Singapore · part of the sankhacooray.com network</span>' +
        '</span><span class="scn-social">' + socialHTML(16) + '</span></div>' +
        '<div class="scn-col"><h5>' + esc(hubs[0]) + '</h5><div class="scn-chips">' + chips + '</div></div>' +
        '<div class="scn-cols">' + cols + '</div>' +
      '</div>';
  }

  var MONO = 'ui-monospace,"JetBrains Mono",Menlo,monospace';
  var CSS =
  '.scn-footer{background:transparent;font-family:inherit;-webkit-font-smoothing:antialiased;color:var(--scn-muted,currentColor);}' +
  '.scn-footer *,.scn-overlay *{box-sizing:border-box;}' +
  '.scn-line{display:flex;align-items:center;justify-content:space-between;gap:8px 16px;max-width:1080px;margin:0 auto;padding:14px 24px;font-size:13px;line-height:1.4;white-space:nowrap;}' +
  '.scn-left{min-width:0;overflow:hidden;text-overflow:ellipsis;}' +
  '.scn-name{color:var(--scn-dim,currentColor);}' +
  '.scn-right{display:inline-flex;align-items:center;gap:6px;flex:none;}' +
  '.scn-netbtn{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border-radius:999px;cursor:pointer;font:inherit;font-size:12.5px;color:var(--scn-dim,currentColor);background:var(--scn-chip,transparent);transition:background-color .15s,color .15s;}' +
  '.scn-netbtn:hover,.scn-netbtn[aria-expanded="true"]{color:var(--scn-fg,currentColor);background:var(--scn-accent-soft,rgba(127,127,127,.15));}' +
  '.scn-netbtn:focus-visible,.scn-social a:focus-visible,.scn-close:focus-visible,.scn-overlay a:focus-visible{outline:2px solid var(--scn-accent,currentColor);outline-offset:2px;}' +
  '.scn-social{display:inline-flex;gap:2px;}' +
  '.scn-social a{width:28px;height:28px;border-radius:999px;display:grid;place-items:center;color:var(--scn-dim,currentColor);text-decoration:none;transition:color .15s,background-color .15s;}' +
  '.scn-social a:hover{color:var(--scn-accent,currentColor);background:var(--scn-accent-soft,rgba(127,127,127,.15));}' +
  '@media(max-width:560px){.scn-line{padding:12px 16px;font-size:12px;gap:8px}.scn-tag{display:none}.scn-netbtn{padding:0 9px}}' +
  /* overlay: full-screen frosted glass, panel centred (rule 18) */
  '.scn-overlay{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:16px;overflow:auto;overscroll-behavior:contain;background:var(--scn-glass,rgba(20,20,24,.6));-webkit-backdrop-filter:blur(18px) saturate(1.2);backdrop-filter:blur(18px) saturate(1.2);color:var(--scn-fg,inherit);font-family:inherit;opacity:0;visibility:hidden;transition:opacity .35s ease,visibility 0s linear .35s;}' +
  '.scn-overlay.scn-open{opacity:1;visibility:visible;transition:opacity .35s ease;}' +
  '.scn-panel{position:relative;width:min(860px,100%);padding:clamp(20px,4vh,36px) clamp(18px,3vw,36px);border-radius:18px;background:var(--scn-surface,rgba(127,127,127,.08));box-shadow:0 20px 60px rgba(0,0,0,.25);}' +
  '.scn-close{all:unset;position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:999px;display:grid;place-items:center;cursor:pointer;color:var(--scn-dim,currentColor);transition:background-color .15s,color .15s;}' +
  '.scn-close:hover{background:var(--scn-accent-soft,rgba(127,127,127,.15));color:var(--scn-fg,currentColor);}' +
  '.scn-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 40px 24px 0;}' +
  '.scn-head>span:nth-child(2){display:flex;flex-direction:column;min-width:0;flex:1 1 220px;}' +
  '.scn-mark{flex:none;width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:var(--scn-accent-soft,rgba(127,127,127,.15));font-family:Georgia,"Times New Roman",serif;font-size:19px;font-style:italic;color:var(--scn-accent,currentColor);}' +
  '.scn-oname{font-family:Georgia,"Times New Roman",serif;font-size:24px;line-height:1.15;color:var(--scn-fg,inherit);}' +
  '.scn-role{font-family:' + MONO + ';font-size:10.5px;letter-spacing:.8px;text-transform:uppercase;color:var(--scn-muted,currentColor);margin-top:4px;white-space:normal;}' +
  '.scn-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;}' +
  '.scn-chip{display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 14px;border-radius:999px;background:var(--scn-chip,rgba(127,127,127,.1));color:var(--scn-dim,currentColor);font-size:14px;text-decoration:none;transition:color .15s,background-color .15s;}' +
  '.scn-chip:hover{color:var(--scn-fg,currentColor);background:var(--scn-accent-soft,rgba(127,127,127,.18));}' +
  '.scn-chip.scn-here{background:var(--scn-accent-soft,rgba(127,127,127,.18));}' +
  '.scn-cols{display:grid;grid-template-columns:repeat(4,1fr);gap:20px 18px;}' +
  '@media(max-width:640px){.scn-cols{grid-template-columns:repeat(2,1fr);}}' +
  '.scn-col h5{font-family:' + MONO + ';font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:var(--scn-accent,currentColor);margin:0 0 10px;font-weight:600;}' +
  '.scn-col ul{list-style:none;margin:0;padding:0;display:grid;gap:8px;background:none;box-shadow:none;}' +
  '.scn-col li{all:unset;display:block;}' +
  '.scn-col ul a{color:var(--scn-dim,currentColor);font-size:14.5px;text-decoration:none;transition:color .15s;display:inline-flex;align-items:center;gap:6px;}' +
  '.scn-col ul a:hover{color:var(--scn-fg,currentColor);}' +
  '.scn-here{color:var(--scn-accent,currentColor)!important;font-weight:600;}' +
  '.scn-here::before{content:"";flex:0 0 auto;width:6px;height:6px;border-radius:50%;background:var(--scn-accent,currentColor);box-shadow:0 0 6px var(--scn-accent,currentColor);animation:scn-pulse 2.4s ease-in-out infinite;}' +
  '@keyframes scn-pulse{0%,100%{opacity:1}50%{opacity:.15}}' +
  '@media(prefers-reduced-motion:reduce){.scn-here::before{animation:none}.scn-overlay,.scn-overlay.scn-open{transition:none}}';

  // ----------------------------------------------------------------- mount
  var FOOTER_EL = null, OVERLAY_EL = null;

  // (Re)apply the auto-detected palette to the mounted footer and its overlay.
  // Called on mount and again whenever the host page's theme changes
  // (light/dark toggle), so the footer follows the page.
  function applyTheme() {
    if (!FOOTER_EL) return;
    var theme = detectTheme();
    var vars =
      "--scn-fg:" + theme.fg + ";--scn-dim:" + theme.dim + ";--scn-muted:" + theme.muted +
      ";--scn-accent:" + theme.accent + ";--scn-accent-soft:" + theme.accentSoft +
      ";--scn-line:" + theme.line + ";--scn-chip:" + theme.chip +
      ";--scn-surface:" + theme.surface + ";--scn-glass:" + theme.glass + ";";
    // No background fill: the footer inherits the parent container's colour.
    FOOTER_EL.style.cssText = vars;
    if (OVERLAY_EL) OVERLAY_EL.style.cssText = vars;
  }

  // React to host-page theme changes: a data-theme/class flip on <html>/<body>,
  // a "sc-themechange" event, or the OS colour-scheme changing.
  function watchTheme() {
    var scheduled = false;
    function ping() {
      if (scheduled) return;
      scheduled = true;
      var run = function () { scheduled = false; applyTheme(); };
      (window.requestAnimationFrame ? requestAnimationFrame(run) : setTimeout(run, 16));
    }
    try {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var a = muts[i].attributeName;
          if (a === "data-theme" || a === "class" || a === "style") { ping(); break; }
        }
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
      if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    } catch (e) {}
    try { window.addEventListener("sc-themechange", ping); } catch (e) {}
    try {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", ping);
      else if (mq.addListener) mq.addListener(ping);
    } catch (e) {}
  }

  // Network overlay: opens on click/tap of the Network button (its content is
  // links, so it must stay open while the pointer moves onto them). Closes on
  // the close button, a click on the glass, or Esc; focus returns to the button.
  function wireOverlay(btn) {
    var ov = document.createElement("div");
    ov.className = "scn-overlay";
    ov.id = UID;
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-labelledby", UID + "-t");
    ov.setAttribute("aria-hidden", "true");
    ov.innerHTML = buildOverlayHTML();
    document.body.appendChild(ov);
    OVERLAY_EL = ov;
    var closeBtn = ov.querySelector(".scn-close");

    function isOpen() { return ov.classList.contains("scn-open"); }
    function open() {
      applyTheme();
      ov.classList.add("scn-open");
      ov.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-expanded", "true");
      try { closeBtn.focus({ preventScroll: true }); } catch (e) {}
    }
    function close(refocus) {
      if (!isOpen()) return;
      ov.classList.remove("scn-open");
      ov.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-expanded", "false");
      if (refocus) try { btn.focus({ preventScroll: true }); } catch (e) {}
    }
    btn.addEventListener("click", function () { isOpen() ? close(true) : open(); });
    closeBtn.addEventListener("click", function () { close(true); });
    ov.addEventListener("click", function (e) { if (e.target === ov) close(true); });
    document.addEventListener("keydown", function (e) {
      if (!isOpen()) return;
      if (e.key === "Escape") { e.preventDefault(); close(true); return; }
      if (e.key === "Tab") {             // keep focus inside the dialog
        var f = ov.querySelectorAll("a[href],button");
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      // Arrow keys belong to the dialog, not to host-page screen paging.
      if (e.key === "ArrowDown" || e.key === "ArrowUp") e.stopPropagation();
    }, true);
  }

  function go() {
    try {
      if (document.getElementById("scn-footer-css") == null) {
        var st = document.createElement("style");
        st.id = "scn-footer-css";
        st.textContent = CSS;
        document.head.appendChild(st);
      }
      var f = document.createElement("footer");
      f.className = "scn-footer";
      f.setAttribute("role", "contentinfo");
      f.innerHTML = buildHTML();
      FOOTER_EL = f;

      var mount = MOUNTSEL ? document.querySelector(MOUNTSEL) : null;
      if (mount) mount.appendChild(f);
      else document.body.appendChild(f);

      try { wireOverlay(f.querySelector(".scn-netbtn")); } catch (e) {}
      applyTheme();
      watchTheme();
    } catch (e) { /* fail soft */ }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", go);
  } else {
    go();
  }
})();
