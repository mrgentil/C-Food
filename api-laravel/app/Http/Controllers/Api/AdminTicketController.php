<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Http\Request;

class AdminTicketController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', 'all');
        $query = SupportTicket::with('user', 'order')->orderBy('updated_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $tickets = $query->paginate(15);
        return view('admin.tickets.index', compact('tickets', 'status'));
    }

    public function show(SupportTicket $ticket)
    {
        $ticket->load(['user', 'order', 'messages.user']);
        return view('admin.tickets.show', compact('ticket'));
    }

    public function reply(Request $request, SupportTicket $ticket)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'status' => 'nullable|in:open,in_progress,closed',
        ]);

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'is_admin' => true,
            'message' => $validated['message'],
        ]);

        if (isset($validated['status']) && $validated['status'] !== $ticket->status) {
            $ticket->update(['status' => $validated['status']]);
        } else {
            // Auto update status to in_progress if it was open
            if ($ticket->status === 'open') {
                $ticket->update(['status' => 'in_progress']);
            } else {
                $ticket->touch(); // Update the updated_at timestamp
            }
        }

        return back()->with('success', 'Votre réponse a été envoyée.');
    }

    public function updateStatus(Request $request, SupportTicket $ticket)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,closed',
        ]);

        $ticket->update(['status' => $validated['status']]);

        return back()->with('success', "Le statut du ticket a été mis à jour.");
    }
}
