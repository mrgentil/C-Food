@props([
    'variant' => 'primary',
    'type' => 'button',
    'href' => null,
    'size' => 'md',
])
@php
    $base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50';
    $sizes = [
        'sm' => 'px-3 py-1.5 text-xs',
        'md' => 'px-4 py-2.5 text-sm',
        'lg' => 'px-6 py-3 text-sm',
    ];
    $variants = [
        'primary' => 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/25 focus:ring-brand-500',
        'secondary' => 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm focus:ring-slate-300',
        'danger' => 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 focus:ring-red-300',
        'warning' => 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 focus:ring-amber-300',
        'success' => 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 focus:ring-emerald-300',
        'ghost' => 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
    ];
    $class = $base . ' ' . ($sizes[$size] ?? $sizes['md']) . ' ' . ($variants[$variant] ?? $variants['primary']);
@endphp
@if($href)
    <a href="{{ $href }}" {{ $attributes->merge(['class' => $class]) }}>{{ $slot }}</a>
@else
    <button type="{{ $type }}" {{ $attributes->merge(['class' => $class]) }}>{{ $slot }}</button>
@endif
