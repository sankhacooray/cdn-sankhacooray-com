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
| `sankha-analytics.js` | Lightweight page-view beacon + "fame" badge (public analytics proxy). | `<script async src=".../js/sankha-analytics.js"></script>` |
| `sankha-weather.js` | Token-free local weather widget (Open-Meteo). | mounts into its own target |
| `sankha-chat.js` | Floating chat widget backed by a public proxy. | self-injecting |

### `sankha-footer.js`

```html
<div id="scn-footer"></div>
<script async src="https://cdn.sankhacooray.com/js/sankha-footer.js"
        data-site="vitals.sankhacooray.com"
        data-tagline="a personal metabolism journal"></script>
```

Auto-themes to the host page (reads its rendered background / text / accent and
derives a matching palette). Optional attributes:

| Attribute | Purpose |
|-----------|---------|
| `data-site` | host this footer lives on → highlights "you are here" |
| `data-tagline` | short line beside the copyright |
| `data-accent` | pin the accent colour if auto-detection looks off |
| `data-mount` | CSS selector of the mount element (default `#scn-footer`; else appended to `<body>`) |

To add a new site to every footer at once, edit the `GROUPS` array in
`js/sankha-footer.js`.

## Hosting

- GitHub Pages, custom domain `cdn.sankhacooray.com` (see `CNAME`).
- `.nojekyll` disables Jekyll so every path is served verbatim.
- DNS: `CNAME cdn → sankhacooray.github.io` (Cloudflare, DNS-only).

## Caching note

GitHub Pages sends a short `Cache-Control` (~10 min) on Pages assets. For a hard
cache-bust after editing a component, append a version query where you reference
it, e.g. `.../js/sankha-footer.js?v=20260625`.
