/* =========================================================================
   sankha-suite.js  ·  shared "app suite" chrome for the medical suite
   Hosted on cdn.sankhacooray.com — edit here once, every app updates.

   Renders: a top-left hamburger → left drawer that cross-links every app in
   the suite (live apps are clickable, upcoming ones show a "Soon" badge), a
   "Free" plan chip next to the app name, and an Upgrade-to-Pro modal. On Aegis
   it also adds the දීර්ඝායු motto chip next to the profile photo.

   Drop-in usage (near the end of <body>, after the app's own scripts):

     <script async src="https://cdn.sankhacooray.com/js/sankha-suite.js?v=20260908"></script>

   The host page supplies the CSS variables (--brand, --muted, --line, --ink,
   --serif, --sans) and a <header> with a .brand and .acctbar (#avatarBtn); the
   active app is inferred from the hostname (override with window.SUITE_APP).
   The suite registry below is the single source of truth — add an app here and
   it appears in every app's sidebar.
   ========================================================================= */
(function () {
  // The suite registry. `soon:true` = upcoming/inactive (shown but not linked).
  var APPS = [
    { id: 'hemoto',  name: 'Hemoto',  desc: 'Bloodwork & Labs',               url: 'https://hemoto.sankhacooray.com/app',  icon: 'fa-droplet',        color: '#d93025' },
    { id: 'aegis',   name: 'Aegis',   desc: 'Medications & SOS',              url: 'https://aegis.sankhacooray.com/app',   icon: 'fa-shield-halved',  color: '#c00000' },
    { id: 'vitals',  name: 'Vitals',  desc: 'Wearables & physiology',         url: 'https://vitals.sankhacooray.com/app', icon: 'fa-heart-pulse',    color: '#0f9d58' },
    { id: 'trophe',  name: 'Trophe',  desc: 'Nutrition & intake',             url: 'https://trophe.sankhacooray.com/app', icon: 'fa-bowl-food',      color: '#e08600', soon: true },
    { id: 'prognos', name: 'Prognos', desc: 'Trends & risk foresight',        url: 'https://prognos.sankhacooray.com/app',icon: 'fa-chart-line',     color: '#2c5aa0', soon: true },
    { id: 'thymos',  name: 'Thymos',  desc: 'Mind, mood & stress',            url: 'https://thymos.sankhacooray.com/app', icon: 'fa-brain',          color: '#7b3fa0', soon: true },
  ];

  function init() {
    var current = window.SUITE_APP || (function () {
      var h = location.hostname;
      for (var i = 0; i < APPS.length; i++) { if (h.indexOf(APPS[i].id) > -1) return APPS[i].id; }
      return '';
    })();

    var css = `
    .sd-btn{border:0;background:transparent;color:var(--muted);font-size:18px;width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex:none}
    .sd-btn:hover{background:rgba(0,0,0,.06);color:var(--ink)}
    .sd-overlay{position:fixed;inset:0;background:rgba(16,24,40,.42);z-index:90;opacity:0;pointer-events:none;transition:opacity .2s}
    .sd-overlay.open{opacity:1;pointer-events:auto}
    .sd-drawer{position:fixed;top:0;left:0;bottom:0;width:300px;max-width:86vw;background:#fff;z-index:91;box-shadow:0 10px 40px rgba(16,24,40,.25);transform:translateX(-100%);transition:transform .22s ease;display:flex;flex-direction:column}
    .sd-drawer.open{transform:none}
    .sd-head{display:flex;align-items:center;gap:10px;padding:16px 16px 14px;border-bottom:1px solid var(--line)}
    .sd-head .sd-grid{width:30px;height:30px;border-radius:8px;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;flex:none}
    .sd-head b{font-size:15px;font-family:var(--serif,inherit)}
    .sd-head .sd-sub{font-size:11px;color:var(--muted);margin-left:2px}
    .sd-head .sd-x{margin-left:auto;border:0;background:transparent;color:var(--muted);font-size:20px;cursor:pointer;width:30px;height:30px;border-radius:7px;line-height:1}
    .sd-head .sd-x:hover{background:rgba(0,0,0,.06)}
    .sd-list{padding:10px;overflow:auto;flex:1}
    .sd-app{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:11px;text-decoration:none;color:var(--ink);margin-bottom:2px}
    .sd-app:hover{background:#f4f6f9}
    .sd-app .sd-ic{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex:none;background:#f1f3f7}
    .sd-app .sd-tx{display:flex;flex-direction:column;min-width:0}
    .sd-app .sd-tx b{font-size:14px}
    .sd-app .sd-tx small{font-size:11.5px;color:var(--muted)}
    .sd-app.active{background:#f4f6f9}
    .sd-app .sd-cur{margin-left:auto;font-size:9.5px;font-weight:700;color:var(--brand);background:#fff;border:1px solid var(--line);border-radius:20px;padding:2px 8px;text-transform:uppercase;letter-spacing:.04em}
    .sd-app.soon{opacity:.6;cursor:default}
    .sd-app .sd-soon{margin-left:auto;font-size:9.5px;font-weight:700;color:var(--muted);background:#fff;border:1px solid var(--line);border-radius:20px;padding:2px 8px;text-transform:uppercase;letter-spacing:.04em}
    .sd-foot{border-top:1px solid var(--line);padding:14px 16px}
    .sd-plan{font-size:12px;color:var(--muted);margin-bottom:9px}
    .sd-up{width:100%;border:0;background:var(--brand);color:#fff;font-weight:600;padding:10px;border-radius:9px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px}
    .sd-up:hover{filter:brightness(.94)}
    .sd-namechips{display:inline-flex;align-items:center;gap:7px;margin-left:-4px}
    @media (max-width:640px){.sd-namechips{gap:5px}}
    .sd-chip{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;color:#0f9d58;background:#e9f7ef;border:1px solid #cdeddb;border-radius:20px;padding:3px 9px;cursor:pointer;line-height:1}
    .sd-chip:hover{border-color:#0f9d58}
    .sd-chip .dot{width:6px;height:6px;border-radius:50%;background:#0f9d58}
    .sd-lk{font-family:"Noto Sans Sinhala","Iskoola Pota",var(--sans,sans-serif)}
    .sd-mov{position:fixed;inset:0;background:rgba(16,24,40,.5);z-index:100;display:none;align-items:center;justify-content:center;padding:20px}
    .sd-mov.open{display:flex}
    .sd-modal{background:#fff;border-radius:16px;max-width:400px;width:100%;padding:26px 26px 22px;box-shadow:0 24px 70px rgba(16,24,40,.35);text-align:center}
    .sd-modal .sd-badge{width:52px;height:52px;border-radius:14px;background:var(--brand);color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
    .sd-modal h3{margin:0 0 8px;font-size:20px;font-family:var(--serif,inherit)}
    .sd-modal p{margin:0 0 18px;color:var(--muted);font-size:14px;line-height:1.55}
    .sd-modal .sd-feat{list-style:none;padding:0;margin:0 0 18px;text-align:left;font-size:13px;color:var(--ink)}
    .sd-modal .sd-feat li{display:flex;align-items:center;gap:9px;padding:5px 0}
    .sd-modal .sd-feat i{color:var(--brand);font-size:12px}
    .sd-modal .sd-actions{display:flex;gap:10px}
    .sd-modal .sd-actions button{flex:1;padding:10px;border-radius:9px;font-weight:600;font-size:13px;cursor:pointer}
    .sd-modal .sd-pri{border:0;background:var(--brand);color:#fff}
    .sd-modal .sd-sec{border:1px solid var(--line);background:#fff;color:var(--ink)}
    @media print{.sd-btn,.sd-chip,.sd-namechips,.sd-drawer,.sd-overlay,.sd-mov{display:none!important}}`;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var appRows = APPS.map(function (a) {
      var ic = '<span class="sd-ic" style="color:' + a.color + '"><i class="fa-solid ' + a.icon + '"></i></span>';
      var tx = '<span class="sd-tx"><b>' + a.name + '</b><small>' + a.desc + '</small></span>';
      if (a.soon) return '<div class="sd-app soon">' + ic + tx + '<span class="sd-soon">Soon</span></div>';
      var active = a.id === current;
      return '<a class="sd-app' + (active ? ' active' : '') + '"' + (active ? '' : ' href="' + a.url + '"') + '>' +
        ic + tx + (active ? '<span class="sd-cur">Current</span>' : '') + '</a>';
    }).join('');

    var drawer = document.createElement('div'); drawer.className = 'sd-drawer';
    drawer.innerHTML =
      '<div class="sd-head"><span class="sd-grid"><i class="fa-solid fa-table-cells-large"></i></span><b>Apps</b><span class="sd-sub">by sankhacooray</span><button class="sd-x" aria-label="Close">&times;</button></div>' +
      '<div class="sd-list">' + appRows + '</div>' +
      '<div class="sd-foot"><div class="sd-plan">You\'re on the <b>Free</b> plan.</div><button class="sd-up"><i class="fa-solid fa-bolt"></i> Upgrade to Pro</button></div>';

    var overlay = document.createElement('div'); overlay.className = 'sd-overlay';
    var modalWrap = document.createElement('div'); modalWrap.className = 'sd-mov';
    modalWrap.innerHTML =
      '<div class="sd-modal"><div class="sd-badge"><i class="fa-solid fa-bolt"></i></div>' +
      '<h3>Upgrade to Pro</h3>' +
      '<p>You\'re on the <b>Free</b> plan. Pro is on the way across every app in the suite.</p>' +
      '<ul class="sd-feat">' +
        '<li><i class="fa-solid fa-check"></i> Higher limits &amp; priority AI</li>' +
        '<li><i class="fa-solid fa-check"></i> More history &amp; profiles</li>' +
        '<li><i class="fa-solid fa-check"></i> One plan across every app</li>' +
      '</ul>' +
      '<div class="sd-actions"><button class="sd-sec" data-close>Maybe later</button><button class="sd-pri" data-waitlist>Notify me</button></div></div>';

    document.body.appendChild(overlay); document.body.appendChild(drawer); document.body.appendChild(modalWrap);

    var header = document.querySelector('header');
    var btn = document.createElement('button'); btn.className = 'sd-btn'; btn.setAttribute('aria-label', 'Apps menu'); btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    if (header) header.insertBefore(btn, header.firstChild);

    // Plan chip — right next to the app name.
    var nameChips = document.createElement('span'); nameChips.className = 'sd-namechips';
    var chip = document.createElement('span'); chip.className = 'sd-chip'; chip.title = 'You\'re on the Free plan — click to upgrade'; chip.innerHTML = '<span class="dot"></span> Free';
    nameChips.appendChild(chip);
    var brand = document.querySelector('.brand');
    if (brand && brand.parentNode) { brand.parentNode.insertBefore(nameChips, brand.nextSibling); }
    else { var acct0 = document.querySelector('.acctbar'); if (acct0) acct0.insertBefore(nameChips, acct0.querySelector('#avatarBtn') || acct0.firstChild); }

    // Aegis motto chip — same chip size/formatting as the plan chip, sitting next
    // to the profile photo, with a question mark and a hover tooltip explaining it.
    var motto = null;
    if (current === 'aegis') {
      var acct = document.querySelector('.acctbar');
      if (acct) {
        motto = document.createElement('span'); motto.className = 'sd-chip sd-lk';
        motto.title = 'දීර්ඝායු — “long life / longevity”';
        motto.innerHTML = '<i class="fa-solid fa-circle-question"></i> දීර්ඝායු';
        acct.insertBefore(motto, acct.querySelector('#avatarBtn') || acct.firstChild);
      }
    }

    function suiteToast(m) { var t = document.getElementById('toast'); if (t) { t.textContent = m; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 2600); } }
    function openD() { drawer.classList.add('open'); overlay.classList.add('open'); }
    function closeD() { drawer.classList.remove('open'); overlay.classList.remove('open'); }
    function openM() { modalWrap.classList.add('open'); }
    function closeM() { modalWrap.classList.remove('open'); }

    if (btn) btn.onclick = openD;
    overlay.onclick = closeD;
    drawer.querySelector('.sd-x').onclick = closeD;
    drawer.querySelector('.sd-up').onclick = function () { closeD(); openM(); };
    chip.onclick = openM;
    if (motto) motto.onclick = function () { suiteToast('දීර්ඝායු — “long life / longevity.” Your emergency card, always ready.'); };
    modalWrap.addEventListener('click', function (e) { if (e.target === modalWrap || e.target.hasAttribute('data-close')) closeM(); });
    modalWrap.querySelector('[data-waitlist]').onclick = function () { closeM(); suiteToast('Thanks — we\'ll let you know when Pro launches.'); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeD(); closeM(); } });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
