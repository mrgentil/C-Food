@props(['title' => null, 'description' => null])
<div class="admin-card overflow-hidden">
    <div class="admin-card-header px-6 py-4">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            @if($title)
                <div>
                    <h3 class="text-base font-semibold text-slate-900">{{ $title }}</h3>
                    @if($description)
                        <p class="text-sm text-slate-500 mt-0.5">{{ $description }}</p>
                    @endif
                </div>
            @endif
            @isset($filters)
                <div class="flex flex-col sm:flex-row flex-wrap gap-2 sm:items-center">
                    {{ $filters }}
                </div>
            @endisset
        </div>
    </div>
    <div class="overflow-x-auto">
        {{ $slot }}
    </div>
    @isset($footer)
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            {{ $footer }}
        </div>
    @endisset
</div>
