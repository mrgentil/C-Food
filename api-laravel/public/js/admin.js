/**
 * C-Food Admin — animations + recherche instantanée (fetch, sans Enter)
 */
(function () {
    const MAIN_ID = 'admin-main';
    const LIVE_HEADERS = {
        'HX-Request': 'true',
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'text/html',
    };

    function $all(sel, root) {
        return Array.from((root || document).querySelectorAll(sel));
    }

    function initPageTransitions() {
        const main = document.getElementById(MAIN_ID);
        if (!main) return;
        requestAnimationFrame(() => main.classList.add('is-visible'));
        $all('#sidebar a.nav-item').forEach((link) => {
            link.addEventListener('click', (e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === '_blank') return;
                main.classList.remove('is-visible');
                main.classList.add('is-leaving');
            });
        });
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) {
                main.classList.remove('is-leaving');
                main.classList.add('is-visible');
            }
        });
    }

    function animateRows(container) {
        if (!container) return;
        $all('tbody tr', container).forEach((row, i) => {
            row.classList.remove('row-enter');
            void row.offsetWidth;
            row.classList.add('row-enter');
            row.style.animationDelay = Math.min(i * 35, 350) + 'ms';
        });
    }

    function getSearchInput(form) {
        return form.querySelector('[data-live-search], input[name="q"]');
    }

    function buildUrlFromForm(form) {
        const base = form.dataset.liveUrl || form.getAttribute('action') || window.location.pathname;
        const url = new URL(base, window.location.origin);
        const data = new FormData(form);
        url.search = '';
        data.forEach((value, key) => {
            if (String(value).trim() !== '') {
                url.searchParams.append(key, value);
            }
        });
        return url;
    }

    async function fetchLiveRegion(regionId, requestUrl, pushUrl) {
        const region = document.getElementById(regionId);
        if (!region) return;

        const form = document.querySelector('[data-live-filter][data-live-target="' + regionId + '"]');
        const q = form ? getSearchInput(form) : null;

        if (form?._liveAbort) form._liveAbort.abort();
        const ctrl = new AbortController();
        if (form) form._liveAbort = ctrl;

        region.classList.add('is-loading');
        if (q) q.classList.add('is-searching');

        try {
            const res = await fetch(requestUrl, { headers: LIVE_HEADERS, signal: ctrl.signal });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const fresh = doc.getElementById(regionId);
            if (!fresh) return;

            region.replaceWith(fresh);
            if (pushUrl !== false) {
                history.pushState(null, '', requestUrl);
            }
            animateRows(fresh);
            wireResetButtons();
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('[admin live]', err);
            }
        } finally {
            const el = document.getElementById(regionId);
            el?.classList.remove('is-loading');
            const liveForm = document.querySelector('[data-live-filter][data-live-target="' + regionId + '"]');
            getSearchInput(liveForm)?.classList.remove('is-searching');
        }
    }

    function scheduleFormFetch(form) {
        clearTimeout(form._liveTimer);
        form._liveTimer = setTimeout(() => {
            const url = buildUrlFromForm(form).toString();
            fetchLiveRegion(form.dataset.liveTarget, url, true);
        }, 380);
    }

    function wireResetButtons() {
        $all('[data-live-reset]').forEach((btn) => {
            if (btn.dataset.liveResetWired) return;
            btn.dataset.liveResetWired = '1';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const form = btn.closest('[data-live-filter]');
                if (!form) return;
                form.querySelectorAll('input:not([type="hidden"]), select').forEach((el) => {
                    if (el.matches('[data-live-search], [name="q"]')) {
                        el.value = '';
                    } else if (el.tagName === 'SELECT') {
                        el.selectedIndex = 0;
                    } else if (el.type === 'text' || el.type === 'search') {
                        el.value = '';
                    }
                });
                form.querySelectorAll('input[type="hidden"]').forEach((el) => {
                    if (el.name === 'scope' || el.name === 'owner_user_id') return;
                    el.value = '';
                });
                const url = (form.dataset.liveUrl || form.action) + '';
                const clean = new URL(url, window.location.origin);
                const scope = form.querySelector('input[name="scope"]');
                const owner = form.querySelector('input[name="owner_user_id"]');
                if (scope?.value) clean.searchParams.set('scope', scope.value);
                if (owner?.value) clean.searchParams.set('owner_user_id', owner.value);
                fetchLiveRegion(form.dataset.liveTarget, clean.toString(), true);
            });
        });
    }

    function initLiveSearch() {
        document.addEventListener('input', (e) => {
            const input = e.target;
            if (!input.matches('[data-live-search], input[name="q"]')) return;
            const form = input.closest('[data-live-filter]');
            if (!form) return;
            scheduleFormFetch(form);
        });

        document.addEventListener('change', (e) => {
            const el = e.target;
            if (el.tagName !== 'SELECT') return;
            const form = el.closest('[data-live-filter]');
            if (!form) return;
            const url = buildUrlFromForm(form).toString();
            fetchLiveRegion(form.dataset.liveTarget, url, true);
        });

        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (!form.matches('[data-live-filter]')) return;
            e.preventDefault();
            const url = buildUrlFromForm(form).toString();
            fetchLiveRegion(form.dataset.liveTarget, url, true);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            const input = e.target;
            if (!input.matches('[data-live-search], input[name="q"]')) return;
            const form = input.closest('[data-live-filter]');
            if (!form) return;
            e.preventDefault();
            clearTimeout(form._liveTimer);
            const url = buildUrlFromForm(form).toString();
            fetchLiveRegion(form.dataset.liveTarget, url, true);
        });

        document.addEventListener('click', (e) => {
            const a = e.target.closest('.admin-live-region nav[role="navigation"] a[href]');
            if (!a || a.hasAttribute('data-live-ignore')) return;
            const region = a.closest('.admin-live-region');
            if (!region?.id) return;
            e.preventDefault();
            fetchLiveRegion(region.id, a.href, true);
        });

        window.addEventListener('popstate', () => {
            const region = document.querySelector('.admin-live-region');
            if (!region?.id) return;
            fetchLiveRegion(region.id, window.location.href, false);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initPageTransitions();
        wireResetButtons();
        initLiveSearch();
    });
})();
