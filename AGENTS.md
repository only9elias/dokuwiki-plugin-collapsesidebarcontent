# dokuwiki-plugin-collapsesidebarcontent

A DokuWiki plugin. DokuWiki loads a plugin from `lib/plugins/<name>/`, where `<name>`
is this repo name **without** the `dokuwiki-plugin-` prefix — i.e. `collapsesidebarcontent`.

## Cursor Cloud specific instructions

The "application" for developing this plugin is a running DokuWiki instance. It is a
flat-file PHP wiki (no database).

- A DokuWiki dev instance lives at `~/dokuwiki` (PHP 8.3, installed outside this repo).
  This repo is symlinked into it at `~/dokuwiki/lib/plugins/collapsesidebarcontent`, so
  edits here are picked up live with no build step.
- Run the dev server from the DokuWiki dir, not this repo:
  `cd ~/dokuwiki && php -S 0.0.0.0:8000`. Then open `http://localhost:8000/doku.php`.
- Admin login for testing: user `admin`, password `admin123` (ACL is enabled).
- There is no build, lint, or test tooling in this repo yet (it is a skeleton). DokuWiki
  plugins conventionally add PHPUnit tests under `_test/` that run inside DokuWiki's own
  test harness; there is no standalone test runner here.
- A plugin is only recognized once it contains `plugin.info.txt` plus its component
  file(s) (e.g. `action.php`, `syntax.php`). An empty repo links fine but shows nothing.
- DokuWiki caches rendered pages and compiled CSS/JS. After changing plugin CSS/JS or
  markup output, purge with `rm -rf ~/dokuwiki/data/cache/*` or append `&purge=true` to a
  page URL to see changes.
