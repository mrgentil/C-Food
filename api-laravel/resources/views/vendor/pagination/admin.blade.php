@if ($paginator->hasPages())
    <nav role="navigation" aria-label="Pagination" class="admin-pagination">
        <div class="admin-pagination-inner">
            @if ($paginator->onFirstPage())
                <span class="admin-page-btn is-disabled" aria-disabled="true">‹</span>
            @else
                <a href="{{ $paginator->previousPageUrl() }}" rel="prev" class="admin-page-btn" aria-label="Page précédente">‹</a>
            @endif

            @foreach ($elements as $element)
                @if (is_string($element))
                    <span class="admin-page-ellipsis">{{ $element }}</span>
                @endif
                @if (is_array($element))
                    @foreach ($element as $page => $url)
                        @if ($page == $paginator->currentPage())
                            <span class="admin-page-btn is-active" aria-current="page">{{ $page }}</span>
                        @else
                            <a href="{{ $url }}" class="admin-page-btn" aria-label="Page {{ $page }}">{{ $page }}</a>
                        @endif
                    @endforeach
                @endif
            @endforeach

            @if ($paginator->hasMorePages())
                <a href="{{ $paginator->nextPageUrl() }}" rel="next" class="admin-page-btn" aria-label="Page suivante">›</a>
            @else
                <span class="admin-page-btn is-disabled" aria-disabled="true">›</span>
            @endif
        </div>
    </nav>
@endif
