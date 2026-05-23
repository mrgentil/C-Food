@props([
    'label' => null,
    'name',
    'type' => 'text',
    'value' => null,
    'required' => false,
    'hint' => null,
    'icon' => false,
])
<div>
    @if($label)
        <label for="{{ $name }}" class="block text-sm font-medium text-slate-700 mb-1.5">
            {{ $label }}
            @if($required)<span class="text-brand-600">*</span>@endif
        </label>
    @endif
    <div class="relative">
        @if($icon)
            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                {!! $icon !!}
            </span>
        @endif
        <input
            type="{{ $type }}"
            name="{{ $name }}"
            id="{{ $name }}"
            value="{{ old($name, $value) }}"
            {{ $required ? 'required' : '' }}
            {{ $attributes->merge(['class' => 'admin-input' . ($icon ? ' has-icon-left' : '')]) }}
        />
    </div>
    @error($name)
        <p class="text-red-600 text-sm mt-1.5 flex items-center gap-1">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"/></svg>
            {{ $message }}
        </p>
    @enderror
    @if($hint && !$errors->has($name))
        <p class="text-xs text-slate-500 mt-1.5">{{ $hint }}</p>
    @endif
</div>
