@props(['title' => 'Aucun élément', 'description' => null, 'colspan' => 1])
<tr>
    <td colspan="{{ $colspan }}" class="px-6 py-16 text-center">
        <div class="mx-auto max-w-sm">
            <div class="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                @if(isset($icon))
                    {{ $icon }}
                @else
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                @endif
            </div>
            <p class="font-semibold text-slate-900">{{ $title }}</p>
            @if($description)
                <p class="mt-1 text-sm text-slate-500">{{ $description }}</p>
            @endif
            @isset($action)
                <div class="mt-4">{{ $action }}</div>
            @endisset
        </div>
    </td>
</tr>
