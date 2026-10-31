# cdn.sankhacooray.com

Shared front-end components for the network; see README.md. Public repo, never commit secrets.

## Build

Edit `js/src/<name>.js`, run `./build.sh`, commit source + minified `js/<name>.js`.
Pages load fixed URLs (`/js/sankha-footer.js` etc.), so never rename outputs.
`sankha-analytics.js` and `sankha-weather.js` must stay byte-identical with the
copies in `v3-sankhacooray-com/js/` (copy the source, build there, `cmp`).

## Lighthouse

<!-- lighthouse-optimized: 2026-10-31 -->
- Baseline (mobile): performance 100, accessibility 96, best-practices 100, SEO 63.
- Fixed: shared scripts minified from `js/src` (analytics, footer, contact, weather); gtag.js now injected after `load` + idle (≤3 s); `/robots.txt` added; index `--muted` raised to ≥4.5:1 in light and dark; footer muted/dim text auto-raised to ≥4.6:1 against the host background.
- Not fixable in-repo: cache lifetime (GitHub Pages fixes `max-age=600`); SEO "blocked from indexing" is the deliberate `noindex` on index.html/me.html.
