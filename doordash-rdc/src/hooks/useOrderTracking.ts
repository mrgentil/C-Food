import { useCallback, useEffect, useRef, useState } from 'react';
import type Echo from 'laravel-echo';

import { getEcho, watchEchoConnection } from '../services/echo';
import { orderService } from '../services/orderService';
import type { ApiOrderTracking } from '../types/api';

type TrackingPayload = ApiOrderTracking;
type LiveStatus = 'offline' | 'connecting' | 'live' | 'polling';

const POLL_MS = 8000;

export function useOrderTracking(orderId: string | undefined) {
  const [order, setOrder] = useState<TrackingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('connecting');
  const channelRef = useRef<ReturnType<Echo<'reverb'>['private']> | null>(null);
  const unwatchRef = useRef<(() => void) | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyPayload = useCallback((payload: TrackingPayload) => {
    setOrder((prev) => ({ ...(prev ?? {}), ...payload } as TrackingPayload));
    setError('');
  }, []);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      return;
    }
    try {
      const response = await orderService.track(orderId);
      if (response?.data) {
        applyPayload(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [applyPayload, orderId]);

  const startPolling = useCallback(() => {
    if (pollRef.current) {
      return;
    }
    pollRef.current = setInterval(fetchOrder, POLL_MS);
    setLiveStatus('polling');
    console.log('[Echo] Fallback polling actif (toutes les 8s)');
  }, [fetchOrder]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!orderId) {
      console.warn('[Echo] orderId manquant — pas de WebSocket');
      setLoading(false);
      setLiveStatus('offline');
      return;
    }

    console.log('[Echo] Suivi commande', orderId);

    let cancelled = false;
    let connectTimeout: ReturnType<typeof setTimeout> | null = null;
    const channelReadyRef = { current: false };

    const setup = async () => {
      setLiveStatus('connecting');
      await fetchOrder();
      if (cancelled) {
        return;
      }

      const echo = await getEcho();
      if (!echo || cancelled) {
        console.warn('[Echo] Instance non créée');
        startPolling();
        return;
      }

      unwatchRef.current = watchEchoConnection(echo, (wsStatus) => {
        if (cancelled) {
          return;
        }
        if (wsStatus === 'failed' || wsStatus === 'disconnected') {
          startPolling();
        }
      });

      connectTimeout = setTimeout(() => {
        if (!cancelled && !channelReadyRef.current) {
          console.warn('[Echo] Timeout 12s — activation du polling');
          startPolling();
        }
      }, 12000);

      const channel = echo.private(`orders.${orderId}`);
      channelRef.current = channel;

      channel.listen('.tracking.updated', (payload: TrackingPayload) => {
        if (!cancelled) {
          applyPayload(payload);
        }
      });

      channel.subscribed(() => {
        if (!cancelled) {
          channelReadyRef.current = true;
          stopPolling();
          setLiveStatus('live');
          console.log('[Echo] Canal OK → En direct', `orders.${orderId}`);
        }
      });

      channel.error((status: Record<string, unknown>) => {
        if (!cancelled) {
          console.warn('[Echo] Erreur canal', JSON.stringify(status));
          startPolling();
        }
      });
    };

    setup().catch((e) => {
      console.warn('[Echo] Setup failed', e?.message);
      startPolling();
    });

    return () => {
      cancelled = true;
      if (connectTimeout) {
        clearTimeout(connectTimeout);
      }
      stopPolling();
      if (unwatchRef.current) {
        unwatchRef.current();
        unwatchRef.current = null;
      }
      if (channelRef.current) {
        try {
          channelRef.current.stopListening('.tracking.updated');
          channelRef.current.unsubscribe();
        } catch {
          // ignore
        }
        channelRef.current = null;
      }
    };
  }, [applyPayload, fetchOrder, orderId, startPolling, stopPolling]);

  const connected = liveStatus === 'live';

  return { order, loading, error, connected, liveStatus, refresh: fetchOrder };
}
