@props(['title' => null, 'description' => null, 'padding' => true, 'flush' => false])
<div {{ $attributes->merge(['class' => 'admin-card overflow-hidden']) }}>
    @if($title)
        <div class="admin-card-header px-6 py-4">
            <h3 class="text-base font-semibold text-slate-900">{{ $title }}</h3>
            @if($description)
                <p class="text-sm text-slate-500 mt-0.5">{{ $description }}</p>
            @endif
        </div>
    @endif
    <div @class(['px-6 py-5' => $padding && !$flush, 'p-0' => $flush])>
        {{ $slot }}
    </div>
</div>
