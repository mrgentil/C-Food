@props(['variant' => 'gray'])
@php
    $variants = [
        'gray' => 'bg-slate-100 text-slate-700 ring-slate-200',
        'brand' => 'bg-brand-50 text-brand-800 ring-brand-200',
        'green' => 'bg-emerald-50 text-emerald-800 ring-emerald-200',
        'red' => 'bg-red-50 text-red-800 ring-red-200',
        'amber' => 'bg-amber-50 text-amber-900 ring-amber-200',
        'blue' => 'bg-indigo-50 text-indigo-800 ring-indigo-200',
        'yellow' => 'bg-yellow-50 text-yellow-800 ring-yellow-200',
    ];
@endphp
<span {{ $attributes->merge(['class' => 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ' . ($variants[$variant] ?? $variants['gray'])]) }}>
    {{ $slot }}
</span>
