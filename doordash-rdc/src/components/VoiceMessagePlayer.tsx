import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../theme';

const SKIP_MS = 10000;

function formatMs(ms: number) {
  const totalSec = Math.max(0, Math.floor((ms || 0) / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function durationFromMeta(mediaMeta?: Record<string, unknown> | null) {
  const d = mediaMeta?.duration;
  if (typeof d !== 'number' || d <= 0) return 0;
  return d < 1000 ? Math.round(d * 1000) : Math.round(d);
}

type Props = {
  uri: string;
  mediaMeta?: Record<string, unknown> | null;
  isMine: boolean;
};

export function VoiceMessagePlayer({ uri, mediaMeta, isMine }: Props) {
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(() => durationFromMeta(mediaMeta));
  const barWidthRef = useRef(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  const accent = isMine ? COLORS.background : COLORS.primary;
  const sub = isMine ? 'rgba(255,255,255,0.9)' : COLORS.textSecondary;
  const trackBg = isMine ? 'rgba(255,255,255,0.35)' : COLORS.border;
  const fillBg = isMine ? COLORS.background : COLORS.primary;

  const totalMs = durationMs > 0 ? durationMs : durationFromMeta(mediaMeta);
  const progress = totalMs > 0 ? Math.min(1, positionMs / totalMs) : 0;

  const onStatusUpdate = useCallback((status: Audio.AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.positionMillis != null) setPositionMs(status.positionMillis);
    if (status.durationMillis != null && status.durationMillis > 0) {
      setDurationMs(status.durationMillis);
    }
    setIsPlaying(!!status.isPlaying);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPositionMs(0);
      soundRef.current?.setPositionAsync(0).catch(() => undefined);
    }
  }, []);

  useEffect(
    () => () => {
      soundRef.current?.unloadAsync().catch(() => undefined);
      soundRef.current = null;
    },
    []
  );

  const ensureSound = useCallback(async () => {
    if (soundRef.current) return soundRef.current;
    setLoading(true);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });
      const { sound: s } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, progressUpdateIntervalMillis: 200 },
        onStatusUpdate
      );
      soundRef.current = s;
      const status = await s.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        setDurationMs(status.durationMillis);
      }
      return s;
    } finally {
      setLoading(false);
    }
  }, [onStatusUpdate, uri]);

  const togglePlay = async () => {
    try {
      const s = await ensureSound();
      const status = await s.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await s.pauseAsync();
        return;
      }
      const atEnd =
        status.didJustFinish ||
        (status.durationMillis && status.positionMillis >= status.durationMillis - 300);
      if (atEnd) await s.setPositionAsync(0);
      await s.playAsync();
    } catch {
      // ignore
    }
  };

  const seekRelative = async (deltaMs: number) => {
    try {
      const s = await ensureSound();
      const status = await s.getStatusAsync();
      if (!status.isLoaded) return;
      const dur = status.durationMillis || totalMs || 0;
      const pos = status.positionMillis || 0;
      const next = Math.max(0, Math.min(Math.max(dur - 50, 0), pos + deltaMs));
      await s.setPositionAsync(next);
      if (!status.isPlaying && dur > 0) setPositionMs(next);
    } catch {
      // ignore
    }
  };

  const seekToRatio = async (ratio: number) => {
    try {
      const s = await ensureSound();
      const status = await s.getStatusAsync();
      const dur = status.isLoaded ? status.durationMillis || totalMs : totalMs;
      if (!status.isLoaded || !dur) return;
      const next = Math.floor(Math.max(0, Math.min(1, ratio)) * dur);
      await s.setPositionAsync(next);
      setPositionMs(next);
    } catch {
      // ignore
    }
  };

  const timeLabel = useMemo(() => {
    if (totalMs > 0) return `${formatMs(positionMs)} / ${formatMs(totalMs)}`;
    return isPlaying ? formatMs(positionMs) : '0:00';
  }, [isPlaying, positionMs, totalMs]);

  return (
    <View style={styles.wrap}>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={togglePlay}
          disabled={loading}
          style={[styles.playBtn, { borderColor: accent }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={accent} />
          ) : (
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color={accent} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => seekRelative(-SKIP_MS)} style={styles.skipBtn}>
          <Ionicons name="play-back" size={20} color={sub} />
          <Text style={[styles.skipLabel, { color: sub }]}>10s</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => seekRelative(SKIP_MS)} style={styles.skipBtn}>
          <Ionicons name="play-forward" size={20} color={sub} />
          <Text style={[styles.skipLabel, { color: sub }]}>10s</Text>
        </TouchableOpacity>
        <Text style={[styles.time, { color: sub }]}>{timeLabel}</Text>
      </View>
      <Pressable
        onLayout={(e) => {
          barWidthRef.current = e.nativeEvent.layout.width;
        }}
        onPress={(e) => {
          const w = barWidthRef.current;
          if (w > 0) seekToRatio(e.nativeEvent.locationX / w);
        }}
        style={[styles.track, { backgroundColor: trackBg }]}
      >
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: fillBg }]} />
        <View
          style={[
            styles.thumb,
            {
              left: `${progress * 100}%`,
              backgroundColor: fillBg,
              borderColor: isMine ? COLORS.primary : COLORS.background,
            },
          ]}
        />
      </Pressable>
      <Text style={[styles.hint, { color: sub }]}>Barre = avancer · −10s / +10s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { minWidth: 240, maxWidth: 280, gap: 8 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: { alignItems: 'center', paddingHorizontal: 4 },
  skipLabel: { fontSize: 9, fontWeight: '700', marginTop: -2 },
  time: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  track: { height: 6, borderRadius: 3, position: 'relative' },
  fill: { height: 6, borderRadius: 3, position: 'absolute', left: 0, top: 0 },
  thumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    borderWidth: 2,
  },
  hint: { fontSize: 10, opacity: 0.85 },
});
