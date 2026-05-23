import { useCallback, useEffect, useRef, useState } from 'react';

import api from '../services/api';
import { getEcho } from '../services/echo';

function normalize(row) {
  return {
    id: String(row.id),
    type: row.type || 'text',
    text: row.message ?? null,
    mediaUrl: row.media_url ?? null,
    mediaMeta: row.media_meta ?? null,
    sender: row.sender_role === 'driver' ? 'driver' : 'client',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

function mergeMessages(prev, incoming) {
  const map = new Map(prev.map((m) => [m.id, m]));
  for (const m of incoming) {
    map.set(m.id, m);
  }
  return Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);
}

const POLL_MS = 15000;

export function useOrderChat(orderId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const channelRef = useRef(null);
  const pollRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await api.get(`/driver/orders/${orderId}/messages`);
      const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
      setMessages((prev) => mergeMessages(prev, rows.map(normalize)));
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Chat indisponible');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const appendFromPayload = useCallback((payload) => {
    setMessages((prev) => mergeMessages(prev, [normalize(payload)]));
  }, []);

  const send = useCallback(
    async (payload) => {
      if (!orderId) throw new Error('Commande inconnue');
      const res = await api.post(`/driver/orders/${orderId}/messages`, payload);
      if (res?.data?.data) {
        appendFromPayload(res.data.data);
      }
    },
    [appendFromPayload, orderId]
  );

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return undefined;
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

      channel.listen('.chat.message', (payload) => {
        if (!cancelled) appendFromPayload(payload);
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
        if (!cancelled && !pollRef.current) {
          pollRef.current = setInterval(fetchMessages, POLL_MS);
        }
      }, 12000);
    };

    setup().catch(() => {
      if (!pollRef.current) pollRef.current = setInterval(fetchMessages, POLL_MS);
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

  return { messages, loading, error, live, refresh: fetchMessages, send, setError };
}
