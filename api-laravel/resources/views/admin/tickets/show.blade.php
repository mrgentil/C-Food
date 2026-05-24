@extends('layouts.app')

@section('header')
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
            <a href="{{ route('admin.tickets') }}" class="text-dark-muted hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </a>
            <x-admin.page-header title="Ticket #{{ $ticket->id }}" subtitle="{{ $ticket->subject }}" />
        </div>
        <div class="flex items-center gap-2">
            <form action="{{ route('admin.tickets.updateStatus', $ticket) }}" method="POST">
                @csrf @method('PUT')
                <select name="status" onchange="this.form.submit()" class="admin-select !py-1.5 !text-sm w-40">
                    <option value="open" {{ $ticket->status === 'open' ? 'selected' : '' }}>Ouvert (Nouveau)</option>
                    <option value="in_progress" {{ $ticket->status === 'in_progress' ? 'selected' : '' }}>En cours</option>
                    <option value="closed" {{ $ticket->status === 'closed' ? 'selected' : '' }}>Fermé (Résolu)</option>
                </select>
            </form>
        </div>
    </div>
@endsection

@section('content')
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Conversation -->
        <div class="lg:col-span-2 flex flex-col h-[70vh]">
            <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-card border border-dark-border rounded-t-xl">
                
                <div class="text-center py-4">
                    <span class="text-xs text-dark-muted bg-dark-bg px-3 py-1 rounded-full border border-dark-border">
                        Ticket ouvert le {{ $ticket->created_at->format('d/m/Y à H:i') }}
                    </span>
                </div>

                @foreach($ticket->messages as $msg)
                    @if($msg->is_admin)
                        <div class="flex justify-end">
                            <div class="bg-brand-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                                <p class="text-sm">{{ $msg->message }}</p>
                                <p class="text-[10px] text-brand-200 text-right mt-1">{{ $msg->created_at->format('H:i') }}</p>
                            </div>
                        </div>
                    @else
                        <div class="flex justify-start items-end gap-2">
                            <div class="w-8 h-8 rounded-full bg-dark-bg border border-dark-border flex-shrink-0 flex items-center justify-center text-xs font-bold text-dark-muted">
                                {{ strtoupper(substr($msg->user->name ?? 'U', 0, 1)) }}
                            </div>
                            <div class="bg-dark-bg border border-dark-border text-white p-3 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
                                <p class="text-sm whitespace-pre-wrap">{{ $msg->message }}</p>
                                <p class="text-[10px] text-dark-muted mt-1">{{ $msg->created_at->format('H:i') }}</p>
                            </div>
                        </div>
                    @endif
                @endforeach
            </div>

            <!-- Reply Box -->
            @if($ticket->status !== 'closed')
                <div class="bg-dark-card p-4 border border-dark-border border-t-0 rounded-b-xl">
                    <form action="{{ route('admin.tickets.reply', $ticket) }}" method="POST">
                        @csrf
                        <div class="flex items-end gap-3">
                            <div class="flex-1">
                                <textarea name="message" rows="2" required placeholder="Votre réponse à {{ $ticket->user->name ?? 'l\'utilisateur' }}..." class="admin-textarea w-full text-sm resize-none"></textarea>
                            </div>
                            <x-admin.button type="submit" variant="primary" class="shrink-0 mb-1">
                                Envoyer
                                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </x-admin.button>
                        </div>
                    </form>
                </div>
            @else
                <div class="bg-dark-bg p-4 border border-dark-border border-t-0 rounded-b-xl text-center text-sm text-dark-muted">
                    Ce ticket est fermé. Vous ne pouvez plus y répondre.
                </div>
            @endif
        </div>

        <!-- Infos -->
        <div class="lg:col-span-1 space-y-6">
            <x-admin.card title="Client">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-full bg-dark-bg border border-dark-border flex shrink-0 items-center justify-center text-lg font-bold text-white">
                        {{ strtoupper(substr($ticket->user->name ?? 'U', 0, 1)) }}
                    </div>
                    <div>
                        <p class="font-semibold text-white">{{ $ticket->user->name ?? 'Client inconnu' }}</p>
                        <p class="text-xs text-dark-muted">Inscrit depuis {{ optional($ticket->user->created_at)->format('M Y') }}</p>
                    </div>
                </div>
                <div class="space-y-2 text-sm">
                    <p class="flex items-center justify-between"><span class="text-dark-muted">Email</span> <span class="text-white">{{ $ticket->user->email ?? 'N/A' }}</span></p>
                    <p class="flex items-center justify-between"><span class="text-dark-muted">Tél.</span> <span class="text-white">{{ $ticket->user->phone ?? 'N/A' }}</span></p>
                </div>
            </x-admin.card>

            @if($ticket->order_id && $ticket->order)
                <x-admin.card title="Détails de la Commande">
                    <div class="space-y-3 text-sm">
                        <p class="flex items-center justify-between"><span class="text-dark-muted">ID</span> <a href="{{ route('admin.orders.show', $ticket->order->id) }}" class="text-brand-500 font-medium hover:underline">#{{ substr($ticket->order->id, 0, 8) }}</a></p>
                        <p class="flex items-center justify-between"><span class="text-dark-muted">Montant</span> <span class="text-white font-bold">{{ number_format($ticket->order->total, 0, ',', ' ') }} FC</span></p>
                        <p class="flex items-center justify-between"><span class="text-dark-muted">Établissement</span> <span class="text-white">{{ $ticket->order->restaurant->name ?? 'N/A' }}</span></p>
                        <p class="flex items-center justify-between"><span class="text-dark-muted">Date</span> <span class="text-white">{{ $ticket->order->created_at->format('d/m/Y') }}</span></p>
                        
                        <div class="pt-3 mt-3 border-t border-dark-border">
                            <a href="{{ route('admin.orders.show', $ticket->order->id) }}" class="block w-full text-center py-2 bg-dark-bg hover:bg-dark-border border border-dark-border rounded-lg text-white font-medium transition-colors">
                                Voir la commande complète
                            </a>
                        </div>
                    </div>
                </x-admin.card>
            @endif
        </div>

    </div>
@endsection
