@props(['href' => null, 'variant' => 'default', 'type' => 'button'])
@php
    $class = 'admin-action-menu-item' . ($variant === 'danger' ? ' is-danger' : ($variant === 'warning' ? ' is-warning' : ''));
@endphp
@if($href)
    <a href="{{ $href }}" {{ $attributes->merge(['class' => $class]) }}>{{ $slot }}</a>
@else
    <button type="{{ $type }}" {{ $attributes->merge(['class' => $class]) }}>{{ $slot }}</button>
@endif
