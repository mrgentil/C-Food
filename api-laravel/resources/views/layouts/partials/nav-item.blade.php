@php
    $href = $href ?? '#';
    $active = $active ?? false;
    $icon = $icon ?? '';
    $label = $label ?? '';
@endphp
<a href="{{ $href }}"
   class="nav-item flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
          {{ $active
              ? 'nav-item-active bg-[#2c2c2e] text-brand-400'
              : 'text-dark-muted hover:bg-dark-bg hover:text-white' }}">
    <span class="shrink-0 {{ $active ? 'text-brand-400' : 'text-dark-muted group-hover:text-white' }}">{!! $icon !!}</span>
    <span class="sidebar-text truncate">{{ $label }}</span>
</a>
