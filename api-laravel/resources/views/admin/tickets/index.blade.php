@extends('layouts.app')

@section('header')
    <div class="flex items-center justify-between">
        <x-admin.page-header title="Support Client" subtitle="Gérez les demandes d'aide et les litiges clients." />
    </div>
@endsection

@section('content')
    <div class="mb-6 flex items-center gap-4">
        <a href="{{ route('admin.tickets', ['status' => 'all']) }}" class="px-4 py-2 text-sm font-medium rounded-lg {{ $status === 'all' ? 'bg-brand-500 text-white' : 'bg-dark-card text-dark-muted hover:text-white' }}">Tous</a>
        <a href="{{ route('admin.tickets', ['status' => 'open']) }}" class="px-4 py-2 text-sm font-medium rounded-lg {{ $status === 'open' ? 'bg-rose-500 text-white' : 'bg-dark-card text-dark-muted hover:text-white' }}">Ouverts</a>
        <a href="{{ route('admin.tickets', ['status' => 'in_progress']) }}" class="px-4 py-2 text-sm font-medium rounded-lg {{ $status === 'in_progress' ? 'bg-amber-500 text-white' : 'bg-dark-card text-dark-muted hover:text-white' }}">En cours</a>
        <a href="{{ route('admin.tickets', ['status' => 'closed']) }}" class="px-4 py-2 text-sm font-medium rounded-lg {{ $status === 'closed' ? 'bg-emerald-500 text-white' : 'bg-dark-card text-dark-muted hover:text-white' }}">Fermés</a>
    </div>

    <x-admin.data-panel title="Tickets de support">
        <table class="admin-table min-w-full">
            <thead>
                <tr>
                    <th class="px-6 py-3 text-left">ID Ticket</th>
                    <th class="px-6 py-3 text-left">Utilisateur</th>
                    <th class="px-6 py-3 text-left">Sujet</th>
                    <th class="px-6 py-3 text-left">Priorité</th>
                    <th class="px-6 py-3 text-left">Statut</th>
                    <th class="px-6 py-3 text-left">Créé le</th>
                </tr>
            </thead>
            <tbody>
                @forelse($tickets as $ticket)
                    <tr class="hover:bg-dark-card/50 cursor-pointer transition-colors" onclick="window.location='{{ route('admin.tickets.show', $ticket) }}'">
                        <td class="px-6 py-4 text-sm font-bold text-white">#{{ $ticket->id }}</td>
                        <td class="px-6 py-4">
                            <p class="text-sm font-medium text-white">{{ $ticket->user->name ?? 'Inconnu' }}</p>
                            <p class="text-xs text-dark-muted">{{ $ticket->user->phone ?? $ticket->user->email ?? '' }}</p>
                        </td>
                        <td class="px-6 py-4">
                            <p class="text-sm text-white font-medium">{{ $ticket->subject }}</p>
                            @if($ticket->order_id)
                                <p class="text-xs text-brand-500 mt-1">Concerne la cde #{{ substr($ticket->order_id, 0, 8) }}</p>
                            @endif
                        </td>
                        <td class="px-6 py-4">
                            @if($ticket->priority === 'high') <x-admin.badge variant="red">Haute</x-admin.badge>
                            @elseif($ticket->priority === 'medium') <x-admin.badge variant="amber">Moyenne</x-admin.badge>
                            @else <x-admin.badge variant="gray">Basse</x-admin.badge> @endif
                        </td>
                        <td class="px-6 py-4">
                            @if($ticket->status === 'open') <x-admin.badge variant="red">Nouveau</x-admin.badge>
                            @elseif($ticket->status === 'in_progress') <x-admin.badge variant="amber">En cours</x-admin.badge>
                            @else <x-admin.badge variant="green">Résolu</x-admin.badge> @endif
                        </td>
                        <td class="px-6 py-4 text-sm text-dark-muted">
                            {{ $ticket->created_at->diffForHumans() }}
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="px-6 py-4 text-center text-sm text-dark-muted">Aucun ticket trouvé.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        <div class="px-6 py-4 border-t border-dark-border">
            {{ $tickets->links() }}
        </div>
    </x-admin.data-panel>
@endsection
