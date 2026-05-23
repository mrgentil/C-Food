import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GradientBackground } from '../components/GradientBackground';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DRIVER_COLORS, DRIVER_GRADIENTS } from '../theme/driverTheme';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';


const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();
  const { settings } = useSettings();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoY = useRef(new Animated.Value(24)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(ringScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 4500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const timer = setTimeout(async () => {
      // 🛠️ POUR LES TESTS : Décommentez la ligne suivante pour réinitialiser l'onboarding livreur à chaque démarrage :
      // await AsyncStorage.removeItem('driver_onboarding_seen');
      
      if (isAuthenticated) {
        navigation.replace('DriverTabs');
      } else {
        const hasSeenOnboarding = await AsyncStorage.getItem('driver_onboarding_seen');
        navigation.replace(hasSeenOnboarding ? 'Login' : 'Onboarding');
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, [navigation, isAuthenticated]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.85],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <GradientBackground
        colors={DRIVER_GRADIENTS.splash}
        style={StyleSheet.absoluteFill}
      />

      {/* Motif décoratif */}
      <View style={styles.decorTop} />
      <View style={styles.decorBottom} />
      <Animated.View
        style={[
          styles.glowOrb,
          { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
        ]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: logoY }, { scale: logoScale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        <View style={styles.logoWrap}>
          <Image
            source={settings?.app_logo ? { uri: settings.app_logo } : require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="motorbike" size={14} color={DRIVER_COLORS.primary} />
          <Text style={styles.badgeText}>LIVREUR</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.titles, { opacity: taglineOpacity }]}>
        <Text style={styles.brand}>C-Food</Text>
        <Text style={styles.tagline}>Livrez. Gagnez. Rayonnez.</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.footerHint}>Préparation de votre espace livreur…</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DRIVER_COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorTop: {
    position: 'absolute',
    top: -width * 0.35,
    right: -width * 0.2,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
  },
  decorBottom: {
    position: 'absolute',
    bottom: -width * 0.4,
    left: -width * 0.25,
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  glowOrb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: DRIVER_COLORS.glow,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  ring: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 2,
    borderColor: 'rgba(14, 165, 233, 0.45)',
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
  },
  logoWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logo: {
    width: 88,
    height: 88,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    color: DRIVER_COLORS.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  titles: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: DRIVER_COLORS.text,
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: DRIVER_COLORS.textMuted,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 56,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: DRIVER_COLORS.primary,
  },
  footerHint: {
    marginTop: 12,
    fontSize: 12,
    color: 'rgba(148, 163, 184, 0.9)',
    fontWeight: '500',
  },
});

export default SplashScreen;
