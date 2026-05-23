@extends('layouts.app')

@section('head')
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .sidebar { transition: all 0.3s; }
        .sidebar.collapsed { width: 70px; }
        .sidebar.collapsed .sidebar-text { display: none; }
        .sidebar.collapsed .logo-text { display: none; }
    </style>
@endsection

@section('header')
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">@yield('page-title', 'Dashboard')</h1>
        <div class="flex items-center space-x-4">
            <button class="p-2 text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.086a6.002 6.002 0 00-4 5.659v3.157c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
            </button>
            <form method="POST" action="{{ route('logout') }}" class="inline">
                @csrf
                <button type="submit" class="text-sm text-gray-600 hover:text-gray-900">
                    Déconnexion
                </button>
            </form>
        </div>
    </div>
@endsection

@section('content')
    @yield('page-content')
@endsection

@section('scripts')
    <script>
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('collapsed');
        }
    </script>
    @yield('page-scripts')
@endsection
