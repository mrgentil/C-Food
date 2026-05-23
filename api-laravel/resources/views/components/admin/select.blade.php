@props(['label' => null, 'name', 'required' => false])
<div>
    @if($label)
        <label for="{{ $name }}" class="block text-sm font-medium text-slate-700 mb-1.5">
            {{ $label }}
            @if($required)<span class="text-brand-600">*</span>@endif
        </label>
    @endif
    <select name="{{ $name }}" id="{{ $name }}" {{ $required ? 'required' : '' }}
            {{ $attributes->merge(['class' => 'admin-select']) }}>
        {{ $slot }}
    </select>
    @error($name)
        <p class="text-red-600 text-sm mt-1.5">{{ $message }}</p>
    @enderror
</div>
