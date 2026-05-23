import { useCallback, useEffect, useRef, useState } from 'react';
import type Echo from 'laravel-echo';

import { getEcho } from '../services/echo';
import { messageService } from '../services/messageService';
import type { ApiOrderMessage, ApiOrderMessageType } from '../types/api';

export type ChatMessage = {
  id: string;
  type: ApiOrderMessageType;
  text: string | null;
  mediaUrl: string | null;
  mediaMeta: Record<string, unknown> | null;
  sender: 'user' | 'driver';
  createdAt: Date;
};

function normalize(row: ApiOrderMessage): ChatMessage {
  return {
    id: String(row.id),
    type: row.type || 'text',
    text: row.message ?? null,
    mediaUrl: row.media_url ?? null,
    mediaMeta: (row.media_meta as Record<string, unknown>) ?? null,
    sender: row.sender_role === 'driver' ? 'driver' : 'user',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

function mergeMessages(prev: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const map = new Map(prev.map((m) => [m.id, m]));
  for (const m of incoming) {
    map.set(m.id, m);
  }
  return Array.from(map.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

const POLL_MS = 15000;

export function useOrderChat(orderId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const channelRef = useRef<ReturnType<Echo<'reverb'>['private']> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await messageService.list(orderId);
      const rows = res.data || [];
      setMessages((prev) => mergeMessages(prev, rows.map((r) => normalize(r))));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Impossible de charger le chat');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const appendFromPayload = useCallback((payload: ApiOrderMessage) => {
    const msg = normalize(payload);
    setMessages((prev) => mergeMessages(prev, [msg]));
  }, []);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const setup = async () => {
      await fetchMessages();
      if (cancelled) return;

      const echo = await getEcho();
      if (!echo) {
        pollRef.current = setInterval(fetchMessages, POLL_MS);
        return;
      }

      const channel = echo.private(`orders.${orderId}`);
      channelRef.current = channel;

      channel.listen('.chat.message', (payload: ApiOrderMessage) => {
        if (!cancelled) {
          appendFromPayload(payload);
        }
      });

      channel.subscribed(() => {
        if (!cancelled) {
          setLive(true);
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      });

      channel.error(() => {
        if (!cancelled && !pollRef.current) {
          pollRef.current = setInterval(fetchMessages, POLL_MS);
          setLive(false);
        }
      });

      setTimeout(() => {
        if (!cancelled && !live && !pollRef.current) {
          pollRef.current = setInterval(fetchMessages, POLL_MS);
        }
      }, 12000);
    };

    setup().catch(() => {
      if (!pollRef.current) {
        pollRef.current = setInterval(fetchMessages, POLL_MS);
      }
    });

    return () => {
      cancelled = true;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (channelRef.current) {
        try {
          channelRef.current.stopListening('.chat.message');
          channelRef.current.unsubscribe();
        } catch {
          // ignore
        }
        channelRef.current = null;
      }
    };
  }, [appendFromPayload, fetchMessages, orderId]);

  const send = useCallback(
    async (payload: Parameters<typeof messageService.send>[1]) => {
      if (!orderId) throw new Error('Commande inconnue');
      const res = await messageService.send(orderId, payload);
      if (res.data) {
        appendFromPayload(res.data);
      }
    },
    [appendFromPayload, orderId]
  );

  return { messages, loading, error, live, refresh: fetchMessages, send, setError };
}
