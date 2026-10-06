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
