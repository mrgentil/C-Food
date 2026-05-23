@props([
    'label',
    'value',
    'icon' => null,
    'color' => 'brand',
    'trend' => null,
])
@php
    $colors = [
        'brand' => ['bg' => 'bg-brand-50', 'icon' => 'text-brand-600', 'ring' => 'ring-brand-100'],
        'blue' => ['bg' => 'bg-blue-50', 'icon' => 'text-blue-600', 'ring' => 'ring-blue-100'],
        'green' => ['bg' => 'bg-emerald-50', 'icon' => 'text-emerald-600', 'ring' => 'ring-emerald-100'],
        'amber' => ['bg' => 'bg-amber-50', 'icon' => 'text-amber-600', 'ring' => 'ring-amber-100'],
        'rose' => ['bg' => 'bg-rose-50', 'icon' => 'text-rose-600', 'ring' => 'ring-rose-100'],
    ];
    $c = $colors[$color] ?? $colors['brand'];
@endphp
<div class="stat-card admin-card p-6">
    <div class="flex items-start justify-between gap-3 relative z-10">
        @if(!empty($icon))
            <div class="w-12 h-12 rounded-2xl {{ $c['bg'] }} ring-4 {{ $c['ring'] }} flex items-center justify-center {{ $c['icon'] }}">
                {{ $icon }}
            </div>
        @endif
        @if($trend)
            <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">{{ $trend }}</span>
        @endif
    </div>
    <p class="mt-4 text-3xl font-bold tracking-tight text-slate-900 relative z-10">{{ $value }}</p>
    <p class="text-sm text-slate-500 mt-1 relative z-10">{{ $label }}</p>
</div>
