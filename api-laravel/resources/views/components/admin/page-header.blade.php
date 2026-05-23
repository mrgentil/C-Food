@props(['title', 'subtitle' => null])
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ $title }}</h1>
        @if($subtitle)
            <p class="text-sm text-slate-500 mt-1 max-w-2xl">{{ $subtitle }}</p>
        @endif
    </div>
    @if(!empty($actions))
        <div class="flex flex-wrap items-center gap-2 shrink-0">
            {{ $actions }}
        </div>
    @endif
</div>
