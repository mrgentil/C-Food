import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

async function setRecordingAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
  });
}

async function setPlaybackAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
  });
}

function formatSeconds(ms) {
  const s = Math.max(0, Math.floor((ms || 0) / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

/**
 * Appuyer une fois = démarrer, appuyer à nouveau = envoyer (plus fiable que maintenir).
 */
export function useVoiceRecorder({ onRecorded, onError }) {
  const [phase, setPhase] = useState('idle'); // idle | preparing | recording
  const [durationMs, setDurationMs] = useState(0);
  const recordingRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(
    () => () => {
      const rec = recordingRef.current;
      recordingRef.current = null;
      if (rec) {
        rec.stopAndUnloadAsync().catch(() => undefined);
      }
    },
    []
  );

  const stopAndSend = useCallback(async () => {
    const rec = recordingRef.current;
    if (!rec || busyRef.current) return;
    busyRef.current = true;

    try {
      await rec.stopAndUnloadAsync();
      await setPlaybackAudioMode();

      const uri = rec.getURI();

      recordingRef.current = null;
      setPhase('idle');
      setDurationMs(0);

      if (!uri) {
        Alert.alert('Erreur', 'Fichier audio introuvable.');
        return;
      }

      await onRecorded?.(uri);
    } catch (e) {
      recordingRef.current = null;
      setPhase('idle');
      setDurationMs(0);
      onError?.(e);
      Alert.alert('Erreur', e?.message || 'Envoi vocal impossible');
    } finally {
      busyRef.current = false;
    }
  }, [onError, onRecorded]);

  const startRecording = useCallback(async () => {
    if (busyRef.current || recordingRef.current) return;
    busyRef.current = true;
    setPhase('preparing');
    setDurationMs(0);

    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setPhase('idle');
        Alert.alert(
          'Microphone',
          'Autorisez le micro dans les réglages du téléphone pour envoyer des messages vocaux.'
        );
        return;
      }

      await setRecordingAudioMode();

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status?.isRecording && status.durationMillis != null) {
            setDurationMs(status.durationMillis);
          }
        },
        250
      );

      recordingRef.current = rec;
      setPhase('recording');
    } catch (e) {
      recordingRef.current = null;
      setPhase('idle');
      onError?.(e);
      Alert.alert('Erreur', e?.message || 'Enregistrement impossible');
    } finally {
      busyRef.current = false;
    }
  }, [onError]);

  const cancelRecording = useCallback(async () => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    setPhase('idle');
    setDurationMs(0);
    if (!rec) return;
    try {
      await rec.stopAndUnloadAsync();
      await setPlaybackAudioMode();
    } catch {
      // ignore
    }
  }, []);

  const toggleRecording = useCallback(async () => {
    if (phase === 'recording' && recordingRef.current) {
      await stopAndSend();
      return;
    }
    if (phase === 'idle') {
      await startRecording();
    }
  }, [phase, startRecording, stopAndSend]);

  return {
    phase,
    recording: phase === 'recording',
    preparing: phase === 'preparing',
    durationLabel: formatSeconds(durationMs),
    toggleRecording,
    stopAndSend,
    cancelRecording,
  };
}
