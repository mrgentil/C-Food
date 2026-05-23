@php
    $href = $href ?? '#';
    $active = $active ?? false;
    $icon = $icon ?? '';
    $label = $label ?? '';
@endphp
<a href="{{ $href }}"
   class="nav-item flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
          {{ $active
              ? 'nav-item-active bg-brand-50 text-brand-600'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}">
    <span class="shrink-0 {{ $active ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-600' }}">{!! $icon !!}</span>
    <span class="sidebar-text truncate">{{ $label }}</span>
</a>
