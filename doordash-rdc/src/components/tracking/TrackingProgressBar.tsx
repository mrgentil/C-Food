import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../theme';
import type { ApiOrderStatus } from '../../types/api';

type Step = {
  key: ApiOrderStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  isCompleted: boolean;
};

type Props = {
  steps: Step[];
};

export function TrackingProgressBar({ steps }: Props) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const completedCount = steps.filter((s) => s.isCompleted).length;
  const activeIndex = steps.findIndex((s) => s.isActive);
  const progressIndex = activeIndex >= 0 ? activeIndex : completedCount;

  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: progressIndex / Math.max(steps.length - 1, 1),
      friction: 8,
      tension: 50,
      useNativeDriver: false,
    }).start();
  }, [progressIndex, steps.length, fillAnim]);

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.row}>
      <View style={styles.trackBg}>
        <Animated.View style={[styles.trackFill, { width: fillWidth }]} />
      </View>
      {steps.map((step) => (
        <View key={step.key} style={styles.stepWrap}>
          <View
            style={[
              styles.dot,
              step.isCompleted && styles.dotDone,
              step.isActive && styles.dotActive,
            ]}
          >
            {step.isCompleted ? (
              <Ionicons name="checkmark" size={12} color="#FFF" />
            ) : step.isActive ? (
              <Ionicons name={step.icon} size={14} color="#FFF" />
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  trackBg: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: 13,
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  trackFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 2,
  },
  stepWrap: { flex: 1, alignItems: 'center', zIndex: 1 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotDone: { backgroundColor: COLORS.success },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});
