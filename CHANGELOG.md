# Changelog

All notable changes to this project are documented in this file.

## 2026-08-02

- Initial MVP: collapsible heading sections and nested lists inside `#dokuwiki__aside`
- Admin settings: `enabled`, `collapselists`, `openlevels` (default 3), `remember`, `autoexpand_current`
- Remember open/closed state in `localStorage` (user toggles only)
- `autoexpand_current`: expand all ancestor chains for page-level current-page links (ignores fragments)
