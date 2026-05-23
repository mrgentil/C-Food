@props(['name' => 'q', 'placeholder' => 'Rechercher…', 'value' => null])
<div class="admin-search-wrap">
    <span class="admin-search-icon" aria-hidden="true">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
    </span>
    <input type="text"
           name="{{ $name }}"
           data-live-search
           autocomplete="off"
           value="{{ $value ?? request($name) }}"
           placeholder="{{ $placeholder }}"
           {{ $attributes->merge(['class' => 'admin-input admin-search-field has-icon-left']) }} />
</div>
