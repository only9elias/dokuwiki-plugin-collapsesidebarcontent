# dokuwiki-plugin-collapsesidebarcontent

A DokuWiki plugin for collapsing content within the sidebar. DokuWiki loads a plugin from `lib/plugins/<name>/`, where `<name>` is
this repo name **without** the `dokuwiki-plugin-` prefix — i.e. `collapsesidebarcontent`.

## Cursor Cloud specific instructions

The "application" for developing this plugin is a running DokuWiki instance. It is a
flat-file PHP wiki (no database).

- A DokuWiki dev instance lives at `~/dokuwiki` (PHP 8.3, installed outside this repo).
  This repo is symlinked into it at `~/dokuwiki/lib/plugins/collapsesidebarcontent`, so
  edits here are picked up live with no build step.
- Run the dev server from the DokuWiki dir, not this repo:
  `cd ~/dokuwiki && php -S 0.0.0.0:8000`. Then open `http://localhost:8000/doku.php`.
- Admin login for testing: user `admin`, password `admin123` (ACL is enabled).
- There is no standalone build or lint tooling in this repo. PHPUnit tests under
  `_test/` are meant to run inside DokuWiki’s own test harness (`~/dokuwiki`); there
  is no standalone test runner here.
- The plugin is an action plugin (`action.php` + `script.js` / `style.css`) that
  enhances the sidebar `#dokuwiki__aside` markup.
- DokuWiki caches rendered pages and compiled CSS/JS. After changing plugin CSS/JS or
  markup output, purge with `rm -rf ~/dokuwiki/data/cache/*` or append `&purge=true` to a
  page URL to see changes.

## Plugin metadata conventions

When creating or updating DokuWiki plugin metadata (`plugin.info.txt`, and matching
`@author` / contact lines in PHP file headers where applicable):

- **email:** use the value of the `DW_PLUGIN_CONTACT_EMAIL` environment variable.
  Do not use personal email addresses. Do not substitute a fallback if the
  variable is missing — ask instead.
- **author:** only9elias
- **url:** https://github.com/only9elias/dokuwiki-plugin-collapsesidebarcontent
- **base:** `collapsesidebarcontent` (repo name without the `dokuwiki-plugin-` prefix)
- **date:** Extension Manager version string (`YYYY-MM-DD`). Bump it in the **same
  commit** as the change that ships, to that commit’s **UTC** calendar date (what
  GitHub’s API / `devel:badextensions` compare against — e.g.
  `TZ=UTC git log -1 --format=%ad --date=format-local:%Y-%m-%d` or `date -u +%Y-%m-%d`
  at commit time). Keep it equal to dokuwiki.org `lastupdate` whenever the plugin
  page exists
  ([publishing](https://www.dokuwiki.org/devel:plugins#publishing_a_plugin_on_dokuwikiorg);
  mismatch breaks update detection —
  [badextensions](https://www.dokuwiki.org/devel:badextensions)). Do not leave
  `date` behind a user-visible change on `main`, and do not bump it in a later
  empty commit.

Support and bug reports are via GitHub Issues (`url`), not email.

Required `plugin.info.txt` fields per DokuWiki: `base`, `author`, `email`, `date`,
`name`, `desc`, `url`. All must be non-empty.
