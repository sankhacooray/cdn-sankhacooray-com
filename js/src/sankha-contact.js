/* =========================================================
   sankha-contact.js · shared contact form for *.sankhacooray.com
   ---------------------------------------------------------
   One file, every site. Edit this readable SOURCE, run ./build.sh to
   regenerate the minified /js/sankha-contact.js, commit both and push;
   each page that loads it picks up the change (GitHub Pages caches for
   about 10 minutes).

   Layout ("option C"): a heading row (the host's own heading on the
   left, the pitch on the right), a full-width message box, then
   Name · Email · Send on one line. Collapses by container width,
   so it fits a wide section or a narrow 560px column alike.

   Drop-in:
     <div id="scn-contact" data-source="music.sankhacooray.com">
       <h2>Get in touch</h2>            <!-- optional: your own heading -->
     </div>
     <script defer src="https://cdn.sankhacooray.com/js/sankha-contact.js?v=20261025"></script>

   Options (data-* on the mount):
     data-source    origin tag stored with each inquiry (default: hostname)
     data-pitch     pitch text before the accent phrase
     data-pitch-em  accent phrase in italics ("" to omit)
     data-note      sentence added after the message placeholder ("" to omit)
     data-title     heading used when the mount has no children
     data-case      "lower" lowercases labels and buttons (dev site style)

   Theming: reads the host page's tokens (--gold or --accent, --surface,
   --border, --text, --text-dim/--dim, --text-muted/--muted, --serif,
   --mono, --cta-fg/--on-accent, --danger), so it follows each site's
   palette and its light/dark switch with no extra code.

   Backend: the public Apps Script web app in contact-sankhacooray-com
   (Sheet row + auto-reply). The URL is public by design.
   ========================================================= */
(function () {
  "use strict";

  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVh7KHZDVkO29XaSiF1zP7LqvwzPy_5yPs4GN4aAofezUaaWaSt36MAwxty_CXe_aSlQ/exec";

  var CSS = [
    ".scc{",
    "  --scc-accent:var(--gold,var(--accent,#c8a26a));",
    "  --scc-accent-hi:var(--gold-hi,var(--accent-hi,color-mix(in srgb,var(--scc-accent) 84%,#fff)));",
    "  --scc-soft:var(--gold-soft,var(--accent-soft,color-mix(in srgb,var(--scc-accent) 14%,transparent)));",
    "  --scc-on:var(--cta-fg,var(--on-accent,var(--bg,#0b0a0d)));",
    "  --scc-surface:var(--surface,rgba(127,127,127,.08));",
    "  --scc-border:var(--border,rgba(127,127,127,.28));",
    "  --scc-text:var(--text,currentColor);",
    "  --scc-dim:var(--text-dim,var(--dim,currentColor));",
    "  --scc-muted:var(--text-muted,var(--muted,var(--text-mute,#8f877a)));",
    "  --scc-danger:var(--danger,#e5534b);",
    "  --scc-serif:var(--serif,'Instrument Serif',Georgia,serif);",
    "  --scc-mono:var(--mono,'JetBrains Mono',ui-monospace,Menlo,monospace);",
    "  container:scc/inline-size;display:flex;flex-direction:column;gap:clamp(18px,3vh,28px);color:var(--scc-text);text-align:left}",
    ".scc *,.scc *::before,.scc *::after{box-sizing:border-box}",
    /* heading row: host heading | pitch, bottoms aligned */
    ".scc-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:clamp(20px,4vw,56px);align-items:end;align-items:last baseline}",
    ".scc .scc-title>*{margin-top:0;margin-bottom:0}",
    ".scc-h{font-family:var(--scc-serif);font-weight:400;font-size:clamp(32px,5.4vh,50px);line-height:1.04;letter-spacing:-.01em}",
    ".scc-pitch{display:flex;flex-direction:column;gap:4px}",
    ".scc .scc-say{margin:0;font-family:var(--scc-serif);font-weight:400;font-size:clamp(22px,3.4vh,30px);line-height:1.2;color:var(--scc-text)}",
    ".scc .scc-say em{color:var(--scc-accent)}",
    /* form */
    ".scc-form{display:flex;flex-direction:column;gap:14px;margin:0}",
    ".scc-form[hidden],.scc-done[hidden]{display:none}",
    ".scc-fields{border:0;margin:0;padding:0;min-width:0;display:flex;flex-direction:column;gap:14px}",
    ".scc-fields[disabled]{opacity:.6}",
    ".scc-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(190px,auto);gap:14px;align-items:end}",
    ".scc-field{display:flex;flex-direction:column;gap:6px;min-width:0}",
    ".scc .scc-field label{font-family:var(--scc-mono);font-size:11.5px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--scc-muted);line-height:1.2}",
    ".scc .scc-field input,.scc .scc-field textarea{display:block;width:100%;margin:0;background:var(--scc-surface);border:1px solid var(--scc-border);border-radius:10px;color:var(--scc-text);font:inherit;font-size:16px;line-height:1.5;padding:10px 14px;transition:border-color .18s,box-shadow .18s}",
    ".scc .scc-field input{height:46px}",
    ".scc .scc-field textarea{height:clamp(96px,15vh,150px);min-height:84px;resize:vertical}",
    ".scc .scc-field input:focus,.scc .scc-field textarea:focus{outline:none;border-color:var(--scc-accent);box-shadow:0 0 0 3px var(--scc-soft)}",
    ".scc .scc-field input::placeholder,.scc .scc-field textarea::placeholder{color:var(--scc-muted);opacity:1}",
    ".scc-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}",
    /* primary CTA: theme pill, lighter fill + glow on hover, never moves */
    ".scc .scc-send{height:46px;padding:0 26px;margin:0;display:inline-flex;align-items:center;justify-content:center;gap:10px;border:0;border-radius:999px;background:var(--scc-accent);color:var(--scc-on);font:inherit;font-size:15.5px;font-weight:600;line-height:1;white-space:nowrap;cursor:pointer;transition:background-color .18s,box-shadow .18s}",
    ".scc .scc-send:hover{background:var(--scc-accent-hi);box-shadow:0 0 0 5px var(--scc-soft)}",
    ".scc .scc-send:focus-visible{outline:2px solid var(--scc-accent);outline-offset:3px}",
    ".scc .scc-send[disabled]{opacity:.75;cursor:progress}",
    ".scc-spin{display:none;width:15px;height:15px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:scc-spin .7s linear infinite}",
    ".scc-send.is-loading .scc-spin{display:inline-block}",
    "@keyframes scc-spin{to{transform:rotate(360deg)}}",
    ".scc .scc-status{margin:0;font-size:14px;line-height:1.4;color:var(--scc-danger)}",
    ".scc-status:empty{display:none}",
    /* sent: same footprint as the form, so nothing below jumps */
    ".scc-done{display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;padding:24px;border-radius:14px;background:var(--scc-surface);box-shadow:inset 0 0 0 1px var(--scc-border);text-align:left}",
    ".scc-check{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:var(--scc-soft);color:var(--scc-accent)}",
    ".scc .scc-done h3{margin:0;font-family:var(--scc-serif);font-weight:400;font-size:28px;line-height:1.1;color:var(--scc-text)}",
    ".scc .scc-done p{margin:2px 0 0;color:var(--scc-dim);font-size:15.5px}",
    ".scc .scc-again{height:40px;padding:0 18px;margin:0;border:0;border-radius:999px;background:transparent;box-shadow:inset 0 0 0 1px var(--scc-border);color:var(--scc-dim);font:inherit;font-size:14.5px;cursor:pointer;transition:background-color .18s,color .18s}",
    ".scc .scc-again:hover{color:var(--scc-text);background:var(--scc-soft)}",
    ".scc .scc-again:focus-visible{outline:2px solid var(--scc-accent);outline-offset:3px}",
    /* narrow containers */
    "@container scc (max-width:680px){",
    "  .scc-head{grid-template-columns:minmax(0,1fr);gap:10px;align-items:start}",
    "  .scc-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}",
    "  .scc-send{grid-column:1/-1;width:100%}",
    "}",
    "@container scc (max-width:420px){",
    "  .scc-row{grid-template-columns:minmax(0,1fr)}",
    "}",
    "@media (prefers-reduced-motion:reduce){.scc-spin{animation-duration:1.6s}}"
  ].join("\n");

  var CHECK_SVG = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';

  var uid = 0;

  function injectStyle() {
    if (document.getElementById("scc-style")) return;
    var s = document.createElement("style");
    s.id = "scc-style";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function attr(mount, name, fallback) {
    return mount.hasAttribute(name) ? mount.getAttribute(name) : fallback;
  }

  function field(id, labelText, control) {
    var f = el("div", "scc-field");
    var l = el("label", null, labelText);
    l.htmlFor = id;
    control.id = id;
    f.appendChild(l);
    f.appendChild(control);
    return f;
  }

  function input(type, name, auto, placeholder) {
    var i = document.createElement("input");
    i.type = type; i.name = name; i.required = true; i.maxLength = 200;
    i.autocomplete = auto; i.placeholder = placeholder;
    return i;
  }

  function build(mount) {
    if (mount.__scc) return;
    mount.__scc = true;
    var n = ++uid;
    var lower = attr(mount, "data-case", "") === "lower";
    var T = function (s) { return lower ? s.toLowerCase() : s; };
    var source = attr(mount, "data-source", location.hostname);

    var root = el("div", "scc");

    /* heading row: keep the host's own heading markup if it gave one */
    var head = el("div", "scc-head");
    var title = el("div", "scc-title");
    if (mount.children.length) {
      while (mount.firstChild) title.appendChild(mount.firstChild);
    } else {
      title.appendChild(el("h2", "scc-h", T(attr(mount, "data-title", "Get in touch"))));
    }
    var pitch = el("div", "scc-pitch");
    var say = el("p", "scc-say", attr(mount, "data-pitch", "Have a project, a question, or just want to"));
    var em = attr(mount, "data-pitch-em", "say hello?");
    if (em) { say.appendChild(document.createTextNode(" ")); say.appendChild(el("em", null, em)); }
    pitch.appendChild(say);
    head.appendChild(title);
    head.appendChild(pitch);

    /* form: message first, then Name · Email · Send on one line */
    var form = el("form", "scc-form");
    form.noValidate = true;
    var fields = el("fieldset", "scc-fields");
    var msg = document.createElement("textarea");
    msg.name = "message"; msg.required = true; msg.maxLength = 5000; msg.rows = 4;
    /* the note rides in the placeholder, so the pitch stays one line level with the heading */
    var noteText = attr(mount, "data-note", "Drop a note and it'll reach me directly.");
    msg.placeholder = T("What's on your mind?" + (noteText ? " " + noteText : ""));
    fields.appendChild(field("scc-message-" + n, T("Message"), msg));

    var row = el("div", "scc-row");
    row.appendChild(field("scc-name-" + n, T("Name"), input("text", "name", "name", T("Your name"))));
    row.appendChild(field("scc-email-" + n, T("Email"), input("email", "email", "email", "you@example.com")));
    var btn = el("button", "scc-send");
    btn.type = "submit";
    var label = el("span", "scc-label", T("Send message"));
    var spin = el("span", "scc-spin"); spin.setAttribute("aria-hidden", "true");
    btn.appendChild(label); btn.appendChild(spin);
    row.appendChild(btn);
    fields.appendChild(row);

    var hp = el("div", "scc-hp"); hp.setAttribute("aria-hidden", "true");
    var hpIn = document.createElement("input");
    hpIn.type = "text"; hpIn.name = "company"; hpIn.tabIndex = -1; hpIn.autocomplete = "off";
    hp.appendChild(field("scc-company-" + n, "Company", hpIn));
    fields.appendChild(hp);
    form.appendChild(fields);

    var status = el("p", "scc-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.appendChild(status);

    /* sent state */
    var done = el("div", "scc-done"); done.hidden = true;
    var check = el("div", "scc-check"); check.innerHTML = CHECK_SVG;
    var doneText = el("div");
    doneText.appendChild(el("h3", null, T("Message sent")));
    doneText.appendChild(el("p", null, T("Thanks for reaching out. I'll get back to you soon.")));
    var again = el("button", "scc-again", T("Send another"));
    again.type = "button";
    done.appendChild(check); done.appendChild(doneText); done.appendChild(again);

    root.appendChild(head);
    root.appendChild(form);
    root.appendChild(done);
    mount.appendChild(root);

    /* behaviour */
    var idle = label.textContent;
    function setLoading(on) {
      fields.disabled = on; btn.disabled = on;
      btn.classList.toggle("is-loading", on);
      btn.setAttribute("aria-busy", on ? "true" : "false");
      label.textContent = on ? T("Sending…") : idle;
    }
    function showError(m) { status.textContent = m; }
    function showDone() {
      done.style.minHeight = form.offsetHeight + "px";
      status.textContent = "";
      form.hidden = true; done.hidden = false;
      again.focus({ preventScroll: true });
    }
    again.addEventListener("click", function () {
      done.hidden = true; form.reset(); form.hidden = false; status.textContent = "";
      setTimeout(function () { msg.focus(); }, 60);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var payload = {
        name: form.elements["name"].value,
        email: form.elements["email"].value,
        message: form.elements["message"].value,
        company: form.elements["company"].value,
        userAgent: navigator.userAgent,
        source: source
      };
      setLoading(true);
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "follow"
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.ok) showDone();
          else showError((d && d.message) || "Something went wrong. Please try again.");
        })
        .catch(function () { showError("Network error. Please try again, or reach me on LinkedIn."); })
        .finally(function () { setLoading(false); });
    });
  }

  function init() {
    var mounts = document.querySelectorAll("#scn-contact, [data-sankha-contact]");
    if (!mounts.length) return;
    injectStyle();
    for (var i = 0; i < mounts.length; i++) build(mounts[i]);
    /* let screen-fit layouts re-measure now that the section has its real height */
    try { window.dispatchEvent(new Event("resize")); } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
