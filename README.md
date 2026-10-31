# cdn.sankhacooray.com

Public, **non-sensitive** shared front-end components for the
`*.sankhacooray.com` network. Served as static files from GitHub Pages at
`https://cdn.sankhacooray.com/`. Edit a component here once and every site that
references it updates — no per-site copy to keep in sync.

> ⚠️ **Public repository.** Never commit anything secret here (API keys, private
> tokens, personal data). Components may talk to *public* Apps Script proxy URLs
> — those are already exposed in client code and are fine. Anything sensitive
> stays in its own private/site repo.

## Components (`/js`)

| File | What it does | Drop-in |
|------|--------------|---------|
| `sankha-footer.js` | Shared network footer — auto-themes to the host page, lists the whole ecosystem + social links. | see below |
| `sankha-suite.js` | Shared app-suite chrome for the medical apps (Hemoto/Aegis/…): hamburger → left drawer cross-linking every app (live + upcoming), a plan chip, and the Aegis motto chip. The `APPS` registry in this file is the single source of truth for the sidebar. | `<script async src=".../js/sankha-suite.js?v=YYYYMMDD"></script>` (needs a `<header>` with `.brand`/`.acctbar`) |
| `sankha-analytics.js` | Lightweight page-view beacon + "fame" badge (public analytics proxy). | `<script async src=".../js/sankha-analytics.js"></script>` |
| `sankha-weather.js` | Token-free local weather widget (Open-Meteo). | mounts into its own target |
| `sankha-chat.js` | Floating chat widget backed by a public proxy. | self-injecting |
| `sankha-contact.js` | Shared contact form: heading row (host heading + pitch), full-width message, Name · Email · Send on one line. Themes from host tokens; posts to the contact Apps Script. | see below |

### `sankha-footer.js`

```html
<div id="scn-footer"></div>
<script async src="https://cdn.sankhacooray.com/js/sankha-footer.js"
        data-site="vitals.sankhacooray.com"
        data-tagline="a personal metabolism journal"></script>
```

Renders **one short line**: `© year Sankha Cooray · tagline` on the left, a
**Network** button and the social icons on the right. No divider line. The full
network map (hubs as chips, the other groups as columns) opens from the Network
button in a full-screen frosted overlay (click/tap; Esc, the close button or a
click on the glass closes it). The tagline hides below 560px so the line stays
one line on phones.

Auto-themes to the host page (reads its rendered background / text / accent and
derives a matching palette; every colour falls back to `currentColor`), and
re-themes on `data-theme`/`class` flips, the `sc-themechange` event and OS
scheme changes. Hosts may still override `--scn-fg`, `--scn-dim`,
`--scn-muted`, `--scn-accent`, `--scn-accent-soft` on `.scn-footer`; the line
itself is `.scn-footer .scn-inner`. Optional attributes:

| Attribute | Purpose |
|-----------|---------|
| `data-site` | host this footer lives on → highlights "you are here" |
| `data-tagline` | short line beside the copyright |
| `data-accent` | pin the accent colour if auto-detection looks off |
| `data-mount` | CSS selector of the mount element (default `#scn-footer`; else appended to `<body>`) |

To add a new site to every footer at once, edit the `GROUPS` array in
`js/sankha-footer.js`.

### `sankha-contact.js`

```html
<div id="scn-contact" data-source="music.sankhacooray.com">
  <h2>Get in touch</h2>   <!-- optional: the site's own heading, kept as-is -->
</div>
<script defer src="https://cdn.sankhacooray.com/js/sankha-contact.js?v=20261025"></script>
```

Renders the whole contact block, handles validation, sending, errors and the
"Message sent" state. Children of the mount become the left side of the heading
row; with none it renders its own "Get in touch". Collapses by container width
(not viewport), so it fits a wide section or a narrow column.

| Attribute | Purpose |
|-----------|---------|
| `data-source` | origin tag stored with each inquiry (default: hostname) |
| `data-pitch` / `data-pitch-em` | pitch line and its italic accent phrase (`""` to omit the accent) |
| `data-note` | sentence added after the message placeholder (`""` to omit) |
| `data-title` | heading text when the mount has no children |
| `data-case="lower"` | lowercase labels and buttons (dev site style) |

Theming comes from the host page's CSS variables: `--gold` or `--accent`,
`--surface`, `--border`, `--text`, `--text-dim`/`--dim`,
`--text-muted`/`--muted`, `--serif`, `--mono`, `--cta-fg`/`--on-accent`,
`--danger`. Override any of them on the section to adjust one site.

Used by: music, make, biomed, design, vitals (health), dev (activity) and
sankhacooray.com (v3). Backend: `contact-sankhacooray-com`.

## Source → build

The URLs above serve **minified** builds. The readable, commented source of
`sankha-analytics.js`, `sankha-footer.js`, `sankha-contact.js` and
`sankha-weather.js` lives in `js/src/`. To change one:

1. Edit `js/src/<name>.js`.
2. Run `./build.sh` (pinned `esbuild@0.24.0`, `--minify --target=es2017`; it
   also runs `node --check` on each output).
3. Commit both `js/src/<name>.js` and `js/<name>.js`, push.

`sankha-analytics.js` and `sankha-weather.js` are also served from the apex
(`v3-sankhacooray-com/js/`). After editing them here, copy the source to
`v3-sankhacooray-com/js/src/`, run its `./build.sh`, and confirm
`cmp` says the two minified files are identical before pushing both repos.
(`sankha-suite.js` and `sankha-chat.js` are still served as source.)

## Hosting

- GitHub Pages, custom domain `cdn.sankhacooray.com` (see `CNAME`).
- `.nojekyll` disables Jekyll so every path is served verbatim.
- DNS: `CNAME cdn → sankhacooray.github.io` (Cloudflare, DNS-only).

## Caching note

GitHub Pages sends a short `Cache-Control` (~10 min) on Pages assets. For a hard
cache-bust after editing a component, append a version query where you reference
it, e.g. `.../js/sankha-footer.js?v=20260625`.
