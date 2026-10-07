# PCAP Farm Machinery Monitoring System — Agent Context Pack

Markdown conversion of *PCAP Farm Machinery Monitoring System — Project Detail Document, Version 2* (28 Sep 2026), split into topic files for AI coding agents.

## Layout

```
AGENTS.md                  # canonical entry point (cross-tool standard); keep short
CLAUDE.md                  # imports @AGENTS.md (Claude Code)
GEMINI.md                  # imports @AGENTS.md (Gemini CLI)
README.md                  # this file (for humans)
docs/
  overview.md  glossary.md  roles-and-permissions.md
  architecture.md  workflow.md  business-rules.md
  data-model.md  non-functional-requirements.md  open-questions.md
  specs/
    qic-module.md  dic-module.md  surveys-tpv-design-optimization.md
    android-app.md  mis-portal.md  machine-type-config.md
    reports-and-certificates.md
  reference/
    source-document-v2.md  # full lossless conversion; archival, do not load by default
```

## Using it

1. Copy the contents into the root of your repository.
2. Open the repo with your agent (Claude Code, Codex CLI, Gemini CLI, Cursor, Copilot, etc.). Tools that read `AGENTS.md` pick it up automatically; `CLAUDE.md` and `GEMINI.md` import it so the content is written once.
3. Fill in the **Commands** section of `AGENTS.md` after the project is scaffolded.
4. Resolve items in `docs/open-questions.md` before implementing the affected features — especially OQ-01, OQ-02, OQ-03.

## Conversion notes

- Content is faithful to the source; nothing was added as fact. Additions that are *not* from the source are labelled "suggested", "derived" or sit in `open-questions.md`.
- Rule IDs (`BR-*`, `NFR-*`, `OQ-*`) were added for traceability.
- The source's own typos were kept out of the specs where the meaning was clear; ambiguous ones are listed in `open-questions.md`.

## Deploy the prototypes to GitHub Pages

The prototypes are static HTML, CSS and JavaScript; no build or package installation is needed.

1. In this repository, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
2. Merge the deployment workflow into `main`. Changes to either prototype, the root `index.html`, or the workflow on `main` deploy automatically.
3. To deploy manually, open **Actions → Deploy prototypes to GitHub Pages → Run workflow** and select `main`.
4. Wait for the workflow to finish; the `github-pages` deployment provides the published URL.

Published entry points (with the default GitHub Pages domain):

- Main prototype: https://m-junad-sabir.github.io/PCAP-track-machines/ (redirects to `app-prototype/`).
- FE app / MIS portal: https://m-junad-sabir.github.io/PCAP-track-machines/app-prototype/
- WebGIS: https://m-junad-sabir.github.io/PCAP-track-machines/webgis/

The MIS portal's **Map View** link already opens the sibling WebGIS page. The workflow preserves both folders, including their JSON data and map photos, so relative asset URLs work under the repository's Pages path. Only those folders and the root redirect are published; the context documents and archive are not included.

**Public demo only:** GitHub Pages serves the JSON files and photos publicly; it is not an authenticated backend. Keep all published data synthetic and do not upload real CNIC numbers, credentials, farmer records or inspection photos. CDN scripts, fonts, map tiles and boundary services still require internet access.
