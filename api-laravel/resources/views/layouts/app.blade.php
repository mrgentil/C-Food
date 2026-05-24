<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'C-FOOD Admin')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    @include('layouts.partials.admin-head')
    @yield('head')
</head>
<body class="admin-app bg-dark-bg flex h-screen overflow-hidden antialiased text-dark-text dark">
    @include('layouts.sidebar')

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        @hasSection('header')
            <header class="shrink-0 bg-dark-card border-b border-dark-border px-8 py-5 flex items-center justify-between z-10 sticky top-0">
                @yield('header')
            </header>
        @endif

        <main id="admin-main" class="flex-1 overflow-y-auto p-6 lg:p-8">
            @if(session('success'))
                <div class="admin-alert mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <svg class="w-5 h-5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>{{ session('success') }}</div>
                </div>
            @endif

            @if(session('error'))
                <div class="admin-alert mb-6 bg-red-50 border border-red-200 text-red-900">
                    <svg class="w-5 h-5 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>{{ session('error') }}</div>
                </div>
            @endif

            @yield('content')
        </main>
    </div>

    @yield('scripts')

    <script src="{{ asset('js/admin.js') }}?v=4" defer></script>

    <script>
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('collapsed');
        }

        (function () {
            function enhance(select) {
                if (!select || select.dataset.searchableEnhanced) return;
                select.dataset.searchableEnhanced = '1';

                const wrapper = document.createElement('div');
                wrapper.className = 'relative';

                const input = document.createElement('input');
                input.type = 'text';
                input.className = (select.className || 'admin-select')
                    .replace('pl-10', 'pl-3')
                    .replace('hidden', '');
                input.placeholder = select.getAttribute('data-placeholder') || 'Rechercher…';

                const dropdown = document.createElement('div');
                dropdown.className = 'absolute z-30 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-soft hidden';

                function getOptions() {
                    return Array.from(select.options).map(o => ({
                        value: o.value,
                        label: o.textContent || '',
                        disabled: o.disabled
                    }));
                }

                function setSelected(value) {
                    select.value = value;
                    const selectedOption = select.selectedOptions && select.selectedOptions[0];
                    input.value = selectedOption ? (selectedOption.textContent || '') : '';
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }

                function render(filterText) {
                    const q = String(filterText || '').toLowerCase();
                    const items = getOptions().filter(o => !o.disabled).filter(o => o.label.toLowerCase().includes(q));
                    dropdown.innerHTML = '';

                    if (items.length === 0) {
                        const empty = document.createElement('div');
                        empty.className = 'px-3 py-2.5 text-sm text-slate-500';
                        empty.textContent = 'Aucun résultat';
                        dropdown.appendChild(empty);
                        return;
                    }

                    for (const it of items) {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-800 transition-colors';
                        btn.textContent = it.label;
                        btn.addEventListener('click', () => {
                            setSelected(it.value);
                            dropdown.classList.add('hidden');
                        });
                        dropdown.appendChild(btn);
                    }
                }

                function open() {
                    render(input.value);
                    dropdown.classList.remove('hidden');
                }
                function close() {
                    dropdown.classList.add('hidden');
                }

                input.addEventListener('focus', open);
                input.addEventListener('input', () => open());
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') close();
                });
                document.addEventListener('click', (e) => {
                    if (!wrapper.contains(e.target)) close();
                });

                setSelected(select.value);

                select.classList.add('hidden');
                select.parentNode.insertBefore(wrapper, select);
                wrapper.appendChild(input);
                wrapper.appendChild(dropdown);
                wrapper.appendChild(select);
            }

            window.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('select[data-searchable="1"]').forEach(enhance);
            });
        })();
    </script>
</body>
</html>
