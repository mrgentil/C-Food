@props([
    'url',
    'target',
])
<form method="GET" action="{{ $url }}"
      autocomplete="off"
      data-live-filter
      data-live-target="{{ $target }}"
      data-live-url="{{ $url }}"
      {{ $attributes->merge(['class' => 'admin-filter-toolbar']) }}>
    {{ $slot }}
</form>
