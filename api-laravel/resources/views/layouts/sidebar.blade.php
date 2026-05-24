@php
    $navIcon = fn($path) => '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="'.$path.'"/></svg>';
@endphp
<div id="sidebar" class="sidebar shrink-0 bg-dark-card w-[var(--sidebar-w)] shadow-sm flex flex-col border-r border-dark-border">
    <div class="p-5 border-b border-dark-border flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
            @php
                $globalSettings = \App\Models\Setting::whereIn('key', ['app_logo', 'primary_color'])->pluck('value', 'key');
                $appLogo = $globalSettings['app_logo'] ?? null;
            @endphp
            @if($appLogo)
                <img src="{{ url($appLogo) }}" alt="Logo" class="w-10 h-10 object-contain shrink-0">
            @else
                <div class="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <span class="text-white font-bold text-lg">D</span>
                </div>
            @endif
            <div class="logo-text min-w-0">
                <span class="font-bold text-lg text-white tracking-tight block truncate">Admin Panel</span>
                <span class="text-[10px] font-medium text-dark-muted uppercase tracking-widest">Administration</span>
            </div>
        </div>
        <button type="button" onclick="toggleSidebar()" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Réduire le menu">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
            </svg>
        </button>
    </div>

    <nav class="flex-1 overflow-y-auto py-4 space-y-1">
        @auth
            @if(auth()->user()->is_admin)
                <p class="nav-section-label px-5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest sidebar-text">Plateforme</p>

                @include('layouts.partials.nav-item', ['href' => route('admin.dashboard'), 'active' => request()->routeIs('admin.dashboard'), 'icon' => $navIcon('M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h12'), 'label' => 'Dashboard'])
                @include('layouts.partials.nav-item', ['href' => route('admin.dispatch'), 'active' => request()->routeIs('admin.dispatch*'), 'icon' => $navIcon('M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l6-2.25 5.447 2.724A1 1 0 0121 8.382v10.764a1 1 0 01-1.447.894L15 17l-6 2.25z M9 7v13 M15 4v13'), 'label' => 'Dispatch Live Map'])
                @include('layouts.partials.nav-item', ['href' => route('admin.settings'), 'active' => request()->routeIs('admin.settings*'), 'icon' => $navIcon('M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'), 'label' => 'Paramètres App'])
                @include('layouts.partials.nav-item', ['href' => route('admin.orders'), 'active' => request()->routeIs('admin.orders*'), 'icon' => $navIcon('M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'), 'label' => 'Commandes'])
                @include('layouts.partials.nav-item', ['href' => route('admin.users'), 'active' => request()->routeIs('admin.users*'), 'icon' => $navIcon('M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'), 'label' => 'Utilisateurs'])
                @include('layouts.partials.nav-item', ['href' => route('admin.push'), 'active' => request()->routeIs('admin.push*'), 'icon' => $navIcon('M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'), 'label' => 'Push Notifications'])
                @include('layouts.partials.nav-item', ['href' => route('admin.restaurants'), 'active' => request()->routeIs('admin.restaurants*'), 'icon' => $navIcon('M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'), 'label' => 'Établissements'])
                @include('layouts.partials.nav-item', ['href' => route('admin.payouts'), 'active' => request()->routeIs('admin.payouts*'), 'icon' => $navIcon('M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'), 'label' => 'Paiements'])
                @include('layouts.partials.nav-item', ['href' => route('admin.tickets'), 'active' => request()->routeIs('admin.tickets*'), 'icon' => $navIcon('M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'), 'label' => 'Support Client'])

                <p class="nav-section-label px-5 mt-6 mb-2 text-[10px] font-bold text-dark-muted uppercase tracking-widest sidebar-text">Contenu app</p>

                @include('layouts.partials.nav-item', ['href' => route('admin.promos'), 'active' => request()->routeIs('admin.promos*'), 'icon' => $navIcon('M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'), 'label' => 'Promos'])
                @include('layouts.partials.nav-item', ['href' => route('admin.appTabs'), 'active' => request()->routeIs('admin.appTabs*'), 'icon' => $navIcon('M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 4a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'), 'label' => 'Onglets app'])
                @include('layouts.partials.nav-item', ['href' => route('admin.categories'), 'active' => request()->routeIs('admin.categories*'), 'icon' => $navIcon('M4 6h16M4 12h16M4 18h7'), 'label' => 'Filtres accueil'])
                @include('layouts.partials.nav-item', ['href' => route('admin.brands'), 'active' => request()->routeIs('admin.brands*'), 'icon' => $navIcon('M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'), 'label' => 'Marques'])
                @include('layouts.partials.nav-item', ['href' => route('admin.banners'), 'active' => request()->routeIs('admin.banners*'), 'icon' => $navIcon('M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'), 'label' => 'Publicités'])
                @include('layouts.partials.nav-item', ['href' => route('admin.menuCategories'), 'active' => request()->routeIs('admin.menuCategories*'), 'icon' => $navIcon('M4 6h16M4 10h16M4 14h16M4 18h16'), 'label' => 'Sections menu'])
                @include('layouts.partials.nav-item', ['href' => route('admin.menuItems'), 'active' => request()->routeIs('admin.menuItems*'), 'icon' => $navIcon('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'), 'label' => 'Articles menu'])

            @elseif(auth()->user()->is_merchant || auth()->user()->is_restaurant)
                <p class="nav-section-label px-5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest sidebar-text">Marchand</p>

                @include('layouts.partials.nav-item', ['href' => route('restaurant.dashboard'), 'active' => request()->routeIs('restaurant.dashboard'), 'icon' => $navIcon('M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3'), 'label' => 'Dashboard'])
                @include('layouts.partials.nav-item', ['href' => route('restaurant.setup'), 'active' => request()->routeIs('restaurant.setup'), 'icon' => $navIcon('M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'), 'label' => 'Établissement'])
                @include('layouts.partials.nav-item', ['href' => route('restaurant.orders'), 'active' => request()->routeIs('restaurant.orders*'), 'icon' => $navIcon('M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'), 'label' => 'Commandes'])
                @include('layouts.partials.nav-item', ['href' => route('restaurant.menu'), 'active' => request()->routeIs('restaurant.menu*'), 'icon' => $navIcon('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'), 'label' => 'Menu'])
                @include('layouts.partials.nav-item', ['href' => route('restaurant.promos'), 'active' => request()->routeIs('restaurant.promos*'), 'icon' => $navIcon('M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'), 'label' => 'Promos'])
            @endif
        @endauth
    </nav>

    <div class="p-4 border-t border-dark-border">
        <div class="flex items-center gap-3 px-2">
            <div class="w-9 h-9 rounded-full bg-dark-bg flex items-center justify-center text-dark-muted text-sm font-bold shrink-0 ring-1 ring-dark-border">
                {{ strtoupper(substr(auth()->user()->name ?? 'U', 0, 1)) }}
            </div>
            <div class="user-meta min-w-0 flex-1">
                <p class="text-sm font-semibold text-white truncate">{{ auth()->user()->name ?? 'User' }}</p>
                <form method="POST" action="{{ route('logout') }}" class="inline">
                    @csrf
                    <button type="submit" class="text-xs text-gray-500 hover:text-brand-500 transition-colors font-medium">Déconnexion</button>
                </form>
            </div>
        </div>
    </div>
</div>
