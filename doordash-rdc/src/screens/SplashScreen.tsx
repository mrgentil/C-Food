import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../theme';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  isAppReady: boolean;
  onFinish: () => void;
}

export default function SplashScreen({ isAppReady, onFinish }: SplashScreenProps) {
  const [entranceDone, setEntranceDone] = useState(false);
  
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.4)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance animations
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(350),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(150),
        Animated.parallel([
          Animated.timing(ringOpacity, {
            toValue: 0.5,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.spring(ringScale, {
            toValue: 1.3,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setEntranceDone(true);
    });
  }, []);

  // Trigger exit when both entrance is finished and application data is loaded
  useEffect(() => {
    if (entranceDone && isAppReady) {
      // Small delay for smooth transition feel
      const timeout = setTimeout(() => {
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, 2000); // Wait 2 seconds after anim is done before fading out
      
      return () => clearTimeout(timeout);
    }
  }, [entranceDone, isAppReady]);

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity }]}>
      <StatusBar style="light" />
      
      {/* Decorative subtle background shapes */}
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      <View style={styles.content}>
        {/* Decorative ripple ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        
        {/* Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Text and Tagline */}
        <Animated.View style={[styles.textContainer, { opacity: taglineOpacity }]}>
          <Text style={styles.appName}>C-Food</Text>
          <Text style={styles.tagline}>Vos restaurants préférés, en un instant</Text>
        </Animated.View>
      </View>

      {/* Loading indicator if loading takes longer than entrance animation */}
      <View style={styles.footer}>
        {!isAppReady && entranceDone && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>Mise à jour des données...</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary, // #0EA5E9
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  circleTop: {
    position: 'absolute',
    top: -width * 0.2,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circleBottom: {
    position: 'absolute',
    bottom: -width * 0.3,
    left: -width * 0.2,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
