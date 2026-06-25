/* =========================================================================
   sankha-footer.js  ·  shared network footer for the sankhacooray.com family
   Hosted on cdn.sankhacooray.com — edit here once, every site updates.

   Drop-in usage (anywhere near the end of <body>):

     <div id="scn-footer"></div>
     <script async src="https://cdn.sankhacooray.com/js/sankha-footer.js"
             data-site="vitals.sankhacooray.com"
             data-tagline="a personal metabolism journal"></script>

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
  var GROUPS = [
    ["Portfolio", [
      ["sankhacooray.com", "sankhacooray.com"],
      ["v2 · archive", "v2.sankhacooray.com"],
      ["v1 · legacy", "v1.sankhacooray.com"]
    ]],
    ["Health & self", [
      ["vitals", "vitals.sankhacooray.com"],
      ["date", "date.sankhacooray.com"],
      ["conduct", "conduct.sankhacooray.com"]
    ]],
    ["Studio & labs", [
      ["ensemble", "ensemble.sankhacooray.com"],
      ["palette", "palette.sankhacooray.com"],
      ["mixlab", "mixlab.sankhacooray.com"],
      ["coffeelab", "coffeelab.sankhacooray.com"],
      ["pixels", "pixels.sankhacooray.com"]
    ]],
    ["Tools", [
      ["fold", "fold.sankhacooray.com"],
      ["biolens", "biolens.sankhacooray.com"],
      ["paynow", "paynow.sankhacooray.com"],
      ["travel", "travel.sankhacooray.com"],
      ["dev", "dev.sankhacooray.com"]
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
    var toward = dark ? [255, 255, 255] : [0, 0, 0];
    return {
      fg:      css(fg),
      surface: css(mix(bg, toward, dark ? 0.05 : 0.04)),
      line:    css(fg, 0.12),
      dim:     css(fg, 0.72),
      muted:   css(fg, 0.45),
      accent:  css(detectAccent(fg))
    };
  }

  // -------------------------------------------------------------- markup/css
  function svg(path) { return '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="' + path + '"/></svg>'; }

  function buildHTML() {
    var year = new Date().getFullYear();
    var social = SOCIAL.map(function (s) {
      return '<a href="' + s[1] + '" title="' + s[0] + '" target="_blank" rel="noopener">' + svg(s[2]) + '</a>';
    }).join("");
    var cols = GROUPS.map(function (g) {
      var items = g[1].map(function (it) {
        var cur = it[1] === HERE;
        return '<li><a class="' + (cur ? "scn-here" : "") + '"' + (cur ? ' aria-current="page"' : '') +
               ' href="https://' + it[1] + '">' + it[0] + '</a></li>';
      }).join("");
      return '<div class="scn-col"><h5>' + g[0] + '</h5><ul>' + items + '</ul></div>';
    }).join("");
    return '<div class="scn-inner"><div class="scn-top">' +
        '<div><div class="scn-mark">SC</div><div class="scn-name">Sankha Cooray</div>' +
        '<div class="scn-role">Developer &amp; Innovator · Singapore</div>' +
        '<div class="scn-social">' + social + '</div></div>' +
        '<div><div class="scn-net-h">Across the network</div><div class="scn-cols">' + cols + '</div></div>' +
      '</div>' +
      '<div class="scn-bar"><span class="scn-dot">part of the sankhacooray.com network</span>' +
      '<span>© ' + year + ' Sankha Cooray' + (TAGLINE ? ' · ' + TAGLINE : '') + '</span></div></div>';
  }

  var CSS =
  '.scn-footer{background:transparent;font-family:"DM Sans",system-ui,sans-serif;-webkit-font-smoothing:antialiased;}' +
  '.scn-footer *{box-sizing:border-box;}' +
  '.scn-inner{max-width:1080px;margin:0 auto;padding:26px 28px 22px;}' +
  '.scn-top{display:grid;grid-template-columns:.9fr 2fr;gap:clamp(28px,5vw,64px);}' +
  '@media(max-width:720px){.scn-top{grid-template-columns:1fr;gap:36px;}}' +
  '.scn-mark{width:42px;height:42px;border-radius:11px;display:grid;place-items:center;border:1px solid var(--scn-line);font-family:Georgia,"Times New Roman",serif;font-size:20px;font-style:italic;color:var(--scn-accent);margin-bottom:16px;}' +
  '.scn-name{font-family:Georgia,"Times New Roman",serif;font-size:26px;color:var(--scn-fg);line-height:1.1;}' +
  '.scn-role{font-family:ui-monospace,"JetBrains Mono",Menlo,monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--scn-muted);margin-top:8px;}' +
  '.scn-social{display:flex;gap:10px;margin-top:20px;}' +
  '.scn-social a{width:34px;height:34px;border-radius:9px;border:1px solid var(--scn-line);display:grid;place-items:center;color:var(--scn-dim);text-decoration:none;transition:.18s;}' +
  '.scn-social a:hover{color:var(--scn-accent);border-color:var(--scn-accent);transform:translateY(-2px);}' +
  '.scn-net-h{font-family:ui-monospace,"JetBrains Mono",Menlo,monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:var(--scn-muted);margin-bottom:16px;display:flex;align-items:center;gap:9px;}' +
  '.scn-net-h::after{content:"";flex:1;height:1px;background:var(--scn-line);}' +
  '.scn-cols{display:grid;grid-template-columns:repeat(4,1fr);gap:22px 18px;}' +
  '@media(max-width:720px){.scn-cols{grid-template-columns:repeat(2,1fr);}}' +
  '.scn-col h5{font-family:ui-monospace,"JetBrains Mono",Menlo,monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--scn-accent);margin:0 0 10px;font-weight:600;}' +
  '.scn-col ul{list-style:none;margin:0;padding:0;display:grid;gap:7px;}' +
  '.scn-col a{color:var(--scn-dim);font-size:13.5px;text-decoration:none;transition:color .15s;display:inline-flex;align-items:center;gap:6px;}' +
  '.scn-col a:hover{color:var(--scn-fg);}' +
  '.scn-here{color:var(--scn-accent)!important;font-weight:600;}' +
  '.scn-here::before{content:"";flex:0 0 auto;width:6px;height:6px;border-radius:50%;background:var(--scn-accent);box-shadow:0 0 6px var(--scn-accent);animation:scn-pulse 2.4s ease-in-out infinite;}' +
  '@keyframes scn-pulse{0%,100%{opacity:1}50%{opacity:.15}}' +
  '@media(prefers-reduced-motion:reduce){.scn-here::before{animation:none}}' +
  '.scn-bar{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;justify-content:space-between;margin-top:22px;padding-top:16px;border-top:1px solid var(--scn-line);font-size:12px;color:var(--scn-muted);}' +
  '.scn-bar .scn-dot{display:inline-flex;align-items:center;gap:7px;font-family:ui-monospace,"JetBrains Mono",Menlo,monospace;font-size:11px;}' +
  '.scn-bar .scn-dot::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--scn-accent);box-shadow:0 0 8px var(--scn-accent);}';

  // ----------------------------------------------------------------- mount
  function go() {
    try {
      if (document.getElementById("scn-footer-css") == null) {
        var st = document.createElement("style");
        st.id = "scn-footer-css";
        st.textContent = CSS;
        document.head.appendChild(st);
      }
      var theme = detectTheme();
      var f = document.createElement("footer");
      f.className = "scn-footer";
      f.setAttribute("role", "contentinfo");
      // No background fill — the footer inherits the parent container's colour.
      f.style.cssText =
        "--scn-fg:" + theme.fg + ";--scn-dim:" + theme.dim + ";--scn-muted:" + theme.muted +
        ";--scn-accent:" + theme.accent + ";--scn-line:" + theme.line + ";";
      f.innerHTML = buildHTML();

      var mount = MOUNTSEL ? document.querySelector(MOUNTSEL) : null;
      if (mount) mount.appendChild(f);
      else document.body.appendChild(f);
    } catch (e) { /* fail soft */ }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", go);
  } else {
    go();
  }
})();
