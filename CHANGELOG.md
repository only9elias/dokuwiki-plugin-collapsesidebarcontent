# Changelog

All notable changes to this project are documented in this file.

## 2026-08-30

- List remember keys use enclosing heading, page id (or label text), and occurrence instead of the first href
- Linkless parents no longer share the nested-list DOM id counter; adding an earlier branch does not remap later remembered state
- Headings without an id key off text + occurrence rather than the generated body id
- Existing remembered list state is ignored (new key format)

## 2026-08-02

- Initial MVP: collapsible heading sections and nested lists inside `#dokuwiki__aside`
- Admin settings: `enabled`, `collapselists`, `openlevels` (default 3), `remember`, `autoexpand_current`
- Remember open/closed state in `localStorage` (user toggles only)
- `autoexpand_current`: expand all ancestor chains for page-level current-page links (ignores fragments; prefers `data-wiki-id`)
