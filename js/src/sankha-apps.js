/* =========================================================================
   sankha-apps.js  ·  shared "mini apps bar" for a suite of related sites
   Hosted on cdn.sankhacooray.com — edit the SUITES registry here once and
   every site in that suite updates.

   Renders one centred row of pill chips (app icon + name) that cross-links
   every site in a suite. The site you are on shows as a non-link chip with a
   gentle pulse in its own colour. It sits at the very bottom of the page, just
   above the footer line.

   Drop-in usage:

     <nav id="scn-apps" data-suite="music"></nav>
     <script defer src="https://cdn.sankhacooray.com/js/sankha-apps.js?v=YYYYMMDD"></script>

   Attributes (on the mount, or on the <script> tag):
     data-suite    key in SUITES below (required)
     data-current  app id to mark as current (default: matched from hostname)
     data-mount    CSS selector of the mount (on the script; default #scn-apps)

   Theming: text inherits the host's colour and font; chip backgrounds are
   tints of currentColor, so it reads on light and dark pages without setup.
   Hosts may override --scn-apps-bg, --scn-apps-hover and --scn-apps-gap.
   After rendering it fires a window "resize" so screen-fit layouts re-measure.
   ========================================================================= */
(function () {
  // The suite registry. `host` identifies the current site; `icon` is served
  // by the app itself so its brand stays in sync; `color` tints its chip.
  var SUITES = {
    music: {
      label: "Sankha's music apps",
      apps: [
        { id: "music",   name: "Music",   host: "music.sankhacooray.com",   url: "https://music.sankhacooray.com/",   icon: "https://music.sankhacooray.com/icon.svg",          color: "#c19a5b", desc: "A music journey: performances, studio work and music × HCI projects" },
        { id: "conduct", name: "Conduct", host: "conduct.sankhacooray.com", url: "https://conduct.sankhacooray.com/", icon: "https://conduct.sankhacooray.com/assets/icon.svg", color: "#9b4ee0", desc: "Your phone's movement becomes the instrument" },
        { id: "gamut",   name: "Gamut",   host: "gamut.sankhacooray.com",   url: "https://gamut.sankhacooray.com/",   icon: "https://gamut.sankhacooray.com/icons/icon.svg",    color: "#2fb8a8", desc: "The world's musical scales on one chromatic wheel" },
        { id: "aruth",   name: "Aruth",   host: "aruth.sankhacooray.com",   url: "https://aruth.sankhacooray.com/",   icon: "https://aruth.sankhacooray.com/assets/icon.svg",   color: "#a7662f", desc: "The literary meaning of Sinhala songs, in English" },
        { id: "cadence", name: "Cadence", host: "cadence.sankhacooray.com", url: "https://cadence.sankhacooray.com/", icon: "https://cadence.sankhacooray.com/assets/icon.svg", color: "#6d4cf2", desc: "A playlist's keys, chords and tempo, grouped by vibe" }
      ]
    }
  };

  var script = document.currentScript;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function attr(mount, name) {
    return (mount && mount.getAttribute(name)) || (script && script.getAttribute(name)) || "";
  }

  var CSS =
    ".scn-apps{--scn-apps-bg:color-mix(in srgb,currentColor 7%,transparent);--scn-apps-hover:color-mix(in srgb,currentColor 13%,transparent);" +
      "display:flex;flex-wrap:wrap;justify-content:center;gap:var(--scn-apps-gap,8px);margin:0;padding:0;font:inherit;line-height:1}" +
    ".scn-apps a,.scn-apps span.scn-app{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px 0 6px;border-radius:999px;" +
      "font-size:14px;font-weight:500;color:inherit;text-decoration:none;background:rgba(127,127,127,.12);background:var(--scn-apps-bg);" +
      "transition:background-color .2s;white-space:nowrap;box-sizing:border-box}" +
    ".scn-apps a:hover,.scn-apps a:focus-visible{background:rgba(127,127,127,.2);background:var(--scn-apps-hover)}" +
    ".scn-apps a:focus-visible{outline:2px solid currentColor;outline-offset:2px}" +
    ".scn-apps img{width:24px;height:24px;border-radius:7px;display:block;flex:none}" +
    ".scn-apps [aria-current]{font-weight:600;animation:scnAppsCur 2.8s ease-in-out infinite}" +
    "@keyframes scnAppsCur{0%,100%{background:color-mix(in srgb,var(--c) 14%,transparent)}50%{background:color-mix(in srgb,var(--c) 32%,transparent)}}" +
    "@media (prefers-reduced-motion:reduce){.scn-apps [aria-current]{animation:none;background:color-mix(in srgb,var(--c) 20%,transparent)}}" +
    "@media (max-width:420px){.scn-apps{--scn-apps-gap:6px}.scn-apps a,.scn-apps span.scn-app{height:32px;font-size:13px;padding:0 11px 0 5px;gap:6px}.scn-apps img{width:22px;height:22px;border-radius:6px}}" +
    "@media print{.scn-apps{display:none!important}}";

  function render() {
    var sel = (script && script.getAttribute("data-mount")) || "#scn-apps";
    var mount = document.querySelector(sel);
    var key = attr(mount, "data-suite");
    var suite = SUITES[key];
    if (!suite) { if (window.console) console.warn("sankha-apps: unknown suite '" + key + "'"); return; }

    var host = location.hostname.replace(/^www\./, "");
    var current = attr(mount, "data-current");
    if (!current) {
      for (var i = 0; i < suite.apps.length; i++) { if (suite.apps[i].host === host) { current = suite.apps[i].id; break; } }
    }

    if (!document.getElementById("scn-apps-css")) {
      var st = document.createElement("style"); st.id = "scn-apps-css"; st.textContent = CSS;
      document.head.appendChild(st);
    }

    var html = suite.apps.map(function (a) {
      var inner = '<img src="' + esc(a.icon) + '" alt="" width="24" height="24" loading="lazy" decoding="async">' + esc(a.name);
      if (a.id === current) return '<span class="scn-app" aria-current="page" style="--c:' + a.color + '">' + inner + "</span>";
      return '<a href="' + esc(a.url) + '" title="' + esc(a.desc) + '">' + inner + "</a>";
    }).join("");

    if (!mount) { mount = document.createElement("nav"); document.body.appendChild(mount); }
    mount.classList.add("scn-apps");
    if (!mount.getAttribute("aria-label")) mount.setAttribute("aria-label", suite.label);
    mount.innerHTML = html;
    try { window.dispatchEvent(new Event("resize")); } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
