import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';

import { resolvePhotoUrl } from '../../utils/mediaUrl';

const FALLBACK_AVATAR =
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200';

type Props = {
  name: string;
  photo?: string | null;
};

export function DriverMapMarker({ name, photo }: Props) {
  const [imageReady, setImageReady] = useState(false);
  const pulse = useState(() => new Animated.Value(0))[0];
  const uri = resolvePhotoUrl(photo) || FALLBACK_AVATAR;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.85],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.callout}>
        <Text style={styles.calloutText} numberOfLines={1}>
          {name.split(' ')[0]}
        </Text>
      </View>

      <View style={styles.avatarWrap}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              opacity: pulseOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
        <View style={styles.avatarBorder}>
          <Image
            source={{ uri }}
            style={styles.avatar}
            onLoad={() => setImageReady(true)}
            onError={() => setImageReady(true)}
          />
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🚲</Text>
          </View>
        </View>
      </View>

      {/* tracksViewChanges hint for parent Marker */}
      {!imageReady ? <View style={styles.hidden} /> : null}
    </View>
  );
}

/** À passer sur <Marker tracksViewChanges={...} /> */
export function useMarkerTracksPhoto(photo?: string | null) {
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    setTracks(true);
    const t = setTimeout(() => setTracks(false), 2500);
    return () => clearTimeout(t);
  }, [photo]);
  return tracks;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  callout: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  calloutText: { fontSize: 13, fontWeight: '700', color: '#111', maxWidth: 120 },
  avatarWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
  },
  avatarBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFF',
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeIcon: { fontSize: 11 },
  hidden: { width: 0, height: 0, opacity: 0 },
});
