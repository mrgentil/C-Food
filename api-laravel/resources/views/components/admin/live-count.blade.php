@props(['total', 'label' => 'résultat', 'labelPlural' => null])
@php($plural = $labelPlural ?? $label.'s')
<span class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 tabular-nums">
    <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
    {{ number_format($total) }} {{ $total > 1 ? $plural : $label }}
</span>
