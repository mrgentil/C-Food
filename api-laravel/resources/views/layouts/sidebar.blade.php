@php
    $navIcon = fn($path) => '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="'.$path.'"/></svg>';
@endphp
<div id="sidebar" class="sidebar shrink-0 bg-white w-[var(--sidebar-w)] shadow-sm flex flex-col border-r border-gray-200">
    <div class="p-5 border-b border-gray-200 flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <span class="text-white font-bold text-lg">D</span>
            </div>
            <div class="logo-text min-w-0">
                <span class="font-bold text-lg text-gray-900 tracking-tight block truncate">Merchant Portal</span>
                <span class="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Administration</span>
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
                @include('layouts.partials.nav-item', ['href' => route('admin.orders'), 'active' => request()->routeIs('admin.orders*'), 'icon' => $navIcon('M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'), 'label' => 'Commandes'])
                @include('layouts.partials.nav-item', ['href' => route('admin.users'), 'active' => request()->routeIs('admin.users*'), 'icon' => $navIcon('M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'), 'label' => 'Utilisateurs'])
                @include('layouts.partials.nav-item', ['href' => route('admin.restaurants'), 'active' => request()->routeIs('admin.restaurants*'), 'icon' => $navIcon('M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'), 'label' => 'Établissements'])

                <p class="nav-section-label px-5 mt-6 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest sidebar-text">Contenu app</p>

                @include('layouts.partials.nav-item', ['href' => route('admin.promos'), 'active' => request()->routeIs('admin.promos*'), 'icon' => $navIcon('M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'), 'label' => 'Promos'])
                @include('layouts.partials.nav-item', ['href' => route('admin.appTabs'), 'active' => request()->routeIs('admin.appTabs*'), 'icon' => $navIcon('M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 4a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'), 'label' => 'Onglets app'])
                @include('layouts.partials.nav-item', ['href' => route('admin.categories'), 'active' => request()->routeIs('admin.categories*'), 'icon' => $navIcon('M4 6h16M4 12h16M4 18h7'), 'label' => 'Filtres accueil'])
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

    <div class="p-4 border-t border-gray-200">
        <div class="flex items-center gap-3 px-2">
            <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-sm font-bold shrink-0 ring-1 ring-gray-200">
                {{ strtoupper(substr(auth()->user()->name ?? 'U', 0, 1)) }}
            </div>
            <div class="user-meta min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-800 truncate">{{ auth()->user()->name ?? 'User' }}</p>
                <form method="POST" action="{{ route('logout') }}" class="inline">
                    @csrf
                    <button type="submit" class="text-xs text-gray-500 hover:text-brand-500 transition-colors font-medium">Déconnexion</button>
                </form>
            </div>
        </div>
    </div>
</div>
