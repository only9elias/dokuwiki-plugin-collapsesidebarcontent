/**
 * Collapse Sidebar Content — expand/collapse inside #dokuwiki__aside
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 */
jQuery(function () {
    'use strict';

    var conf = (typeof JSINFO !== 'undefined' && JSINFO.collapsesidebarcontent)
        ? JSINFO.collapsesidebarcontent
        : null;

    if (!conf || !conf.enabled) {
        return;
    }

    var $aside = jQuery('#dokuwiki__aside');
    if (!$aside.length) {
        return;
    }

    // Prefer the included page content; fall back to the aside root.
    var $root = $aside.find('> .pad > .content, > .pad .content').first();
    if (!$root.length) {
        $root = $aside;
    }

    if ($root.data('collapsesidebarcontent-init')) {
        return;
    }
    $root.data('collapsesidebarcontent-init', 1);

    var openlevels = parseInt(conf.openlevels, 10);
    if (isNaN(openlevels) || openlevels < 1) {
        openlevels = 3;
    }

    var lang = (typeof LANG !== 'undefined' && LANG.plugins && LANG.plugins.collapsesidebarcontent)
        ? LANG.plugins.collapsesidebarcontent
        : {};
    var labelExpand = lang.toggle || 'Expand sidebar section';
    var labelCollapse = lang.toggle_close || 'Collapse sidebar section';

    var bodyCounter = 0;
    var listIdCounter = 0;
    var headingKeyCounts = {};
    var listKeyCounts = {};
    var storageKey = buildStorageKey();
    var remembered = conf.remember ? loadRemembered() : {};

    /**
     * @returns {string}
     */
    function buildStorageKey() {
        var base = (typeof DOKU_BASE !== 'undefined') ? DOKU_BASE : '/';
        var sidebar = conf.sidebar || '';
        return 'collapsesidebarcontent:' + base + ':' + sidebar;
    }

    /**
     * @returns {Object}
     */
    function loadRemembered() {
        try {
            var raw = window.localStorage.getItem(storageKey);
            if (!raw) {
                return {};
            }
            var parsed = JSON.parse(raw);
            return (parsed && typeof parsed === 'object') ? parsed : {};
        } catch (e) {
            return {};
        }
    }

    /**
     * Persist remembered state (user toggles only).
     */
    function saveRemembered() {
        if (!conf.remember) {
            return;
        }
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(remembered));
        } catch (e) {
            // Quota / private mode — ignore.
        }
    }

    /**
     * @param {string} key
     * @param {boolean} expanded
     * @param {boolean} persist
     */
    function rememberState(key, expanded, persist) {
        if (!key || !conf.remember || !persist) {
            return;
        }
        remembered[key] = expanded ? 1 : 0;
        saveRemembered();
    }

    /**
     * @param {jQuery} $heading
     * @returns {number}
     */
    function headingLevel($heading) {
        var tag = ($heading.prop('tagName') || '').toLowerCase();
        var match = tag.match(/^h([1-5])$/);
        return match ? parseInt(match[1], 10) : 1;
    }

    /**
     * @param {jQuery} $branch
     * @param {jQuery} $panel
     * @param {jQuery} $toggle
     * @param {boolean} expanded
     * @param {string} [key]
     * @param {boolean} [persist]
     */
    function setExpanded($branch, $panel, $toggle, expanded, key, persist) {
        $branch.toggleClass('collapsesidebarcontent__collapsed', !expanded);
        $branch.toggleClass('collapsesidebarcontent__open', expanded);
        if ($panel && $panel.length && $panel.is('div.collapsesidebarcontent__body')) {
            $panel.toggleClass('collapsesidebarcontent__collapsed', !expanded);
            $panel.toggleClass('collapsesidebarcontent__open', expanded);
        }
        $toggle.attr('aria-expanded', expanded ? 'true' : 'false');
        $toggle.attr('aria-label', expanded ? labelCollapse : labelExpand);
        $toggle.attr('title', expanded ? labelCollapse : labelExpand);
        if (expanded) {
            $panel.removeAttr('hidden');
        } else {
            $panel.attr('hidden', 'hidden');
        }
        if (typeof key === 'string') {
            rememberState(key, expanded, !!persist);
        }
    }

    /**
     * @param {boolean} startExpanded
     * @param {string} key
     * @returns {boolean}
     */
    function initialExpanded(startExpanded, key) {
        if (conf.remember && Object.prototype.hasOwnProperty.call(remembered, key)) {
            return !!remembered[key];
        }
        return startExpanded;
    }

    /**
     * @param {jQuery} $toggle
     * @param {jQuery} $branch
     * @param {jQuery} $panel
     * @param {string} key
     */
    function bindToggle($toggle, $branch, $panel, key) {
        $toggle.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var open = !$branch.hasClass('collapsesidebarcontent__collapsed');
            setExpanded($branch, $panel, $toggle, !open, key, true);
        });
    }

    /**
     * 1A — heading sections
     */
    function initHeadings() {
        var $headings = $root.find('h1, h2, h3, h4, h5').filter(function () {
            var $h = jQuery(this);
            // Template mobile chrome for the whole sidebar
            if ($h.is('h3.toggle')) {
                return false;
            }
            // Already enhanced
            if ($h.data('collapsesidebarcontent-heading')) {
                return false;
            }
            return true;
        });

        $headings.each(function () {
            var $heading = jQuery(this);
            var level = headingLevel($heading);
            var $siblings = $heading.nextUntil(function () {
                var $el = jQuery(this);
                if (!$el.is('h1, h2, h3, h4, h5')) {
                    return false;
                }
                if ($el.is('h3.toggle')) {
                    return false;
                }
                return headingLevel($el) <= level;
            });

            if (!$siblings.length) {
                return;
            }

            var $body = jQuery('<div class="collapsesidebarcontent__body"></div>');
            bodyCounter += 1;
            var bodyId = 'collapsesidebarcontent__body-' + bodyCounter;
            $body.attr('id', bodyId);
            $siblings.wrapAll($body);
            $body = $heading.next('.collapsesidebarcontent__body');

            var key = headingRememberKey($heading);

            var $toggle = jQuery('<button type="button" class="collapsesidebarcontent__toggle"></button>');
            $toggle.attr('aria-controls', bodyId);
            $toggle.append(jQuery('<span class="collapsesidebarcontent__icon" aria-hidden="true"></span>'));

            $heading.data('collapsesidebarcontent-heading', 1);
            $heading.addClass('collapsesidebarcontent__heading');
            $heading.prepend($toggle);

            var $branch = $heading.add($body);
            // Store refs on heading for auto-expand / state
            $heading.data('csc-panel', $body);
            $heading.data('csc-toggle', $toggle);
            $heading.data('csc-key', key);
            $body.data('csc-heading', $heading);

            var startExpanded = level < openlevels;
            setExpanded(
                $heading,
                $body,
                $toggle,
                initialExpanded(startExpanded, key),
                key,
                false
            );
            bindToggle($toggle, $heading, $body, key);
        });
    }

    /**
     * @param {jQuery} $heading
     * @returns {string}
     */
    function headingRememberKey($heading) {
        var id = $heading.attr('id');
        if (id) {
            return 'h:' + id;
        }
        var tag = ($heading.prop('tagName') || 'h').toLowerCase();
        var text = jQuery.trim($heading.text()).toLowerCase().replace(/\s+/g, ' ');
        var base = text ? (tag + ':t:' + text) : (tag + ':anon');
        headingKeyCounts[base] = (headingKeyCounts[base] || 0) + 1;
        return 'h:' + base + ':' + headingKeyCounts[base];
    }

    /**
     * Enclosing heading id, or '_' when the list is not under a heading.
     *
     * @param {jQuery} $el
     * @returns {string}
     */
    function enclosingHeadingPart($el) {
        var $body = $el.closest('div.collapsesidebarcontent__body');
        if (!$body.length) {
            return '_';
        }
        var $heading = $body.data('csc-heading');
        if (!$heading || !$heading.length) {
            $heading = $body.prev('h1, h2, h3, h4, h5');
        }
        if (!$heading.length) {
            return '_';
        }
        var id = $heading.attr('id');
        if (id) {
            return id;
        }
        return $heading.data('csc-key') || '_';
    }

    /**
     * @param {jQuery} $li
     * @returns {jQuery}
     */
    function listBranchLink($li) {
        var $link = $li.children('div.li').find('a[href]').filter(function () {
            var href = jQuery(this).attr('href') || '';
            return href.indexOf('#') === -1;
        }).first();
        if ($link.length) {
            return $link;
        }
        return $li.children('a[href]').filter(function () {
            var href = jQuery(this).attr('href') || '';
            return href.indexOf('#') === -1;
        }).first();
    }

    /**
     * @param {jQuery} $li
     * @returns {string}
     */
    function listBranchIdentity($li) {
        var $link = listBranchLink($li);
        if ($link.length) {
            var wikiId = $link.attr('data-wiki-id');
            if (wikiId) {
                return 'id:' + normalizeId(wikiId);
            }
            var href = $link.attr('href') || '';
            var pageId = pageIdFromHref(href);
            if (pageId) {
                return 'id:' + pageId;
            }
            return 'href:' + href;
        }

        var $label = $li.children('div.li').first();
        var text;
        if ($label.length) {
            text = $label.text();
        } else {
            text = $li.clone().children('ul, ol').remove().end().text();
        }
        text = jQuery.trim(text).toLowerCase().replace(/\s+/g, ' ');
        if (text) {
            return 't:' + text;
        }
        return 'anon';
    }

    /**
     * heading + identity + occurrence. DOM ids use listIdCounter, not this.
     *
     * @param {jQuery} $li
     * @returns {string}
     */
    function listBranchKey($li) {
        var base = enclosingHeadingPart($li) + ':' + listBranchIdentity($li);
        listKeyCounts[base] = (listKeyCounts[base] || 0) + 1;
        return 'l:' + base + ':' + listKeyCounts[base];
    }

    /**
     * @param {jQuery} $li
     * @returns {number}
     */
    function listLevel($li) {
        var match = ($li.attr('class') || '').match(/\blevel(\d+)\b/);
        return match ? parseInt(match[1], 10) : 1;
    }

    /**
     * 1B — nested list branches
     */
    function initLists() {
        if (!conf.collapselists) {
            return;
        }

        $root.find('li').each(function () {
            var $li = jQuery(this);
            var $childUl = $li.children('ul');
            if (!$childUl.length) {
                return;
            }
            if ($li.find('> .collapsesidebarcontent__toggle, > div.li > .collapsesidebarcontent__toggle').length) {
                return;
            }

            var key = listBranchKey($li);
            var ulId = $childUl.attr('id');
            if (!ulId) {
                listIdCounter += 1;
                ulId = 'collapsesidebarcontent__ul-' + listIdCounter;
                $childUl.attr('id', ulId);
            }

            var $toggle = jQuery('<button type="button" class="collapsesidebarcontent__toggle"></button>');
            $toggle.attr('aria-controls', ulId);
            $toggle.append(jQuery('<span class="collapsesidebarcontent__icon" aria-hidden="true"></span>'));

            var $divLi = $li.children('div.li').first();
            if ($divLi.length) {
                $divLi.prepend($toggle);
            } else {
                $li.prepend($toggle);
            }

            $li.addClass('collapsesidebarcontent__branch');
            $li.data('csc-panel', $childUl);
            $li.data('csc-toggle', $toggle);
            $li.data('csc-key', key);

            var level = listLevel($li);
            var startExpanded = level < openlevels;
            setExpanded(
                $li,
                $childUl,
                $toggle,
                initialExpanded(startExpanded, key),
                key,
                false
            );
            bindToggle($toggle, $li, $childUl, key);
        });
    }

    /**
     * Normalize a page id for comparison.
     *
     * @param {string} id
     * @returns {string}
     */
    function normalizeId(id) {
        return String(id || '').replace(/^:+/, '').replace(/:+$/, '').toLowerCase();
    }

    /**
     * Extract wiki page id from an href, or null if not a plain page link.
     *
     * @param {string} href
     * @returns {?string}
     */
    function pageIdFromHref(href) {
        if (!href || href.indexOf('#') !== -1) {
            return null;
        }
        // Ignore external / special schemes
        if (/^(https?:|mailto:|javascript:)/i.test(href)) {
            // May still be same-host doku link — parse below via anchor
        }

        var a = document.createElement('a');
        a.href = href;
        if (a.hash) {
            return null;
        }
        if (a.host && a.host !== window.location.host) {
            return null;
        }

        var params = {};
        var search = a.search || '';
        if (search.charAt(0) === '?') {
            search.substring(1).split('&').forEach(function (pair) {
                var parts = pair.split('=');
                var k = decodeURIComponent(parts[0] || '');
                var v = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
                params[k] = v;
            });
        }
        if (params.id) {
            return normalizeId(params.id);
        }

        // Compare to server-provided current page URL (no hash)
        if (conf.pageurl) {
            var b = document.createElement('a');
            b.href = conf.pageurl;
            if (a.pathname.replace(/\/+$/, '') === b.pathname.replace(/\/+$/, '') &&
                (a.search || '') === (b.search || '')) {
                return normalizeId(JSINFO.id);
            }
        }

        // userewrite=2: .../doku.php/page:id
        var path = a.pathname || '';
        var m = path.match(/\/doku\.php\/(.+)$/);
        if (m) {
            return normalizeId(decodeURIComponent(m[1]));
        }

        return null;
    }

    /**
     * Force-expand a branch without persisting.
     *
     * @param {jQuery} $branch
     */
    function forceExpand($branch) {
        var $panel = $branch.data('csc-panel');
        var $toggle = $branch.data('csc-toggle');
        if (!$panel || !$toggle || !$panel.length || !$toggle.length) {
            return;
        }
        setExpanded($branch, $panel, $toggle, true, null, false);
    }

    /**
     * Expand heading bodies and list branches that contain $el.
     *
     * @param {jQuery} $el
     */
    function expandAncestors($el) {
        // List branches
        $el.parents('li.collapsesidebarcontent__branch').each(function () {
            forceExpand(jQuery(this));
        });
        // Heading bodies: element may sit inside wrapped bodies
        $el.parents('div.collapsesidebarcontent__body').each(function () {
            var $body = jQuery(this);
            var $heading = $body.data('csc-heading') || $body.prev('h1, h2, h3, h4, h5');
            if ($heading && $heading.length) {
                forceExpand($heading);
            }
        });
    }

    /**
     * autoexpand_current — expand all matching page-level link chains
     */
    function autoExpandCurrent() {
        if (!conf.autoexpand_current) {
            return;
        }
        if (typeof JSINFO === 'undefined' || !JSINFO.id) {
            return;
        }

        var currentId = normalizeId(JSINFO.id);
        var $matches = $root.find('a[href]').filter(function () {
            var $a = jQuery(this);
            var href = $a.attr('href') || '';
            // Section/fragment links never count, even on the current page.
            if (href.indexOf('#') !== -1) {
                return false;
            }
            var wikiId = $a.attr('data-wiki-id');
            if (wikiId) {
                return normalizeId(wikiId) === currentId;
            }
            var id = pageIdFromHref(href);
            return id !== null && id === currentId;
        });

        if (!$matches.length) {
            return;
        }

        $matches.each(function () {
            expandAncestors(jQuery(this));
        });
    }

    initHeadings();
    initLists();
    autoExpandCurrent();
});
