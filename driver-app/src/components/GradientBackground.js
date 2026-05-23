import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Dégradé sans dépendance native (évite les soucis expo-linear-gradient / Expo Go).
 */
export function GradientBackground({ colors = ['#0B1220', '#0369A1'], style, children }) {
  const [top, mid, bottom] = [
    colors[0] || '#0B1220',
    colors[1] || colors[0],
    colors[2] || colors[1] || colors[0],
  ];

  return (
    <View style={[styles.root, style, { backgroundColor: top }]}>
      <View style={[styles.layer, styles.mid, { backgroundColor: mid }]} />
      <View style={[styles.layer, styles.bottom, { backgroundColor: bottom }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  mid: {
    opacity: 0.55,
    top: '25%',
    height: '55%',
  },
  bottom: {
    opacity: 0.85,
    top: '55%',
    height: '50%',
  },
});
