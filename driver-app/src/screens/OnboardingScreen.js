import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../components/GradientBackground';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DRIVER_COLORS, DRIVER_GRADIENTS } from '../theme/driverTheme';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.52;

const slides = [
  {
    id: '1',
    gradient: DRIVER_GRADIENTS.slide1,
    accent: DRIVER_COLORS.primary,
    eyebrow: 'Courses à proximité',
    title: 'Acceptez en un\ntap, livrez vite',
    description:
      'Recevez les commandes autour de vous, visualisez restaurant et client, et partez en livraison en quelques secondes.',
    bullets: ['Carte & distances claires', 'Acceptation instantanée', 'Navigation guidée'],
    visual: 'orders',
  },
  {
    id: '2',
    gradient: DRIVER_GRADIENTS.slide2,
    accent: '#14B8A6',
    eyebrow: 'Suivi en direct',
    title: 'Le client vous\nvoit arriver',
    description:
      'Votre position est partagée en temps réel. Moins d’appels, moins de stress — une livraison fluide pour tout le monde.',
    bullets: ['GPS actif pendant la course', 'Chat intégré', 'Statuts mis à jour'],
    visual: 'tracking',
  },
  {
    id: '3',
    gradient: DRIVER_GRADIENTS.slide3,
    accent: '#818CF8',
    eyebrow: 'Gains & confiance',
    title: 'Chaque livraison\ncompte pour vous',
    description:
      'Suivez vos courses terminées, sécurisez chaque étape et validez la remise avec preuve si besoin.',
    bullets: ['Historique & gains', 'Preuve de livraison', 'Support C-Food'],
    visual: 'earnings',
  },
];

function SlideVisual({ type, accent }) {
  if (type === 'orders') {
    return (
      <View style={visualStyles.stage}>
        <View style={[visualStyles.floatingCard, visualStyles.cardBack]}>
          <MaterialCommunityIcons name="store" size={22} color={accent} />
          <Text style={visualStyles.cardTitle}>Restaurant</Text>
          <Text style={visualStyles.cardMeta}>2,4 km · 8 min</Text>
        </View>
        <View style={[visualStyles.floatingCard, visualStyles.cardMain]}>
          <View style={visualStyles.cardHeader}>
            <View style={[visualStyles.dot, { backgroundColor: accent }]} />
            <Text style={visualStyles.cardBadge}>NOUVELLE COURSE</Text>
          </View>
          <Text style={visualStyles.cardAmount}>12 500 FC</Text>
          <Text style={visualStyles.cardSub}>3 articles · Paiement OK</Text>
          <View style={[visualStyles.acceptBtn, { backgroundColor: accent }]}>
            <Text style={visualStyles.acceptText}>Accepter</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </View>
        </View>
        <View style={[visualStyles.mapPin, { borderColor: accent }]}>
          <Ionicons name="navigate" size={28} color={accent} />
        </View>
      </View>
    );
  }

  if (type === 'tracking') {
    return (
      <View style={visualStyles.stage}>
        <View style={[visualStyles.floatingCard, visualStyles.trackCard]}>
          <View style={visualStyles.trackRow}>
            <View style={[visualStyles.avatar, { backgroundColor: accent }]}>
              <Ionicons name="person" size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={visualStyles.cardTitle}>Marie K.</Text>
              <Text style={visualStyles.cardMeta}>En route vers vous</Text>
            </View>
            <View style={visualStyles.livePill}>
              <View style={visualStyles.liveDot} />
              <Text style={visualStyles.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={visualStyles.timeline}>
            {['Récupéré', 'En route', 'Arrivé'].map((step, i) => (
              <View key={step} style={visualStyles.timelineStep}>
                <View
                  style={[
                    visualStyles.timelineDot,
                    i <= 1 && { backgroundColor: accent },
                  ]}
                />
                <Text
                  style={[
                    visualStyles.timelineLabel,
                    i <= 1 && { color: '#F8FAFC', fontWeight: '700' },
                  ]}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={[visualStyles.chatBubble, { backgroundColor: accent }]}>
          <Ionicons name="chatbubble-ellipses" size={22} color="#FFF" />
        </View>
      </View>
    );
  }

  return (
    <View style={visualStyles.stage}>
      <View style={[visualStyles.floatingCard, visualStyles.earnCard]}>
        <Text style={visualStyles.earnLabel}>Aujourd’hui</Text>
        <Text style={[visualStyles.earnValue, { color: accent }]}>48 200 FC</Text>
        <View style={visualStyles.earnBars}>
          {[40, 65, 45, 80, 55, 90].map((h, i) => (
            <View
              key={i}
              style={[
                visualStyles.earnBar,
                { height: h, backgroundColor: i === 5 ? accent : 'rgba(255,255,255,0.25)' },
              ]}
            />
          ))}
        </View>
        <View style={visualStyles.earnFooter}>
          <Ionicons name="shield-checkmark" size={18} color={DRIVER_COLORS.accent} />
          <Text style={visualStyles.earnFooterText}>12 livraisons validées</Text>
        </View>
      </View>
      <View style={visualStyles.proofChip}>
        <Ionicons name="camera" size={16} color="#FFF" />
        <Text style={visualStyles.proofText}>Preuve photo</Text>
      </View>
    </View>
  );
}

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const finish = async () => {
    await AsyncStorage.setItem('driver_onboarding_seen', 'true');
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Login');
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      finish();
    }
  };

  const progressWidth = scrollX.interpolate({
    inputRange: slides.map((_, i) => i * width),
    outputRange: slides.map((_, i) => `${((i + 1) / slides.length) * 100}%`),
    extrapolate: 'clamp',
  });

  const renderSlide = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const heroScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: 'clamp',
    });
    const heroOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width }]}>
        <Animated.View style={{ opacity: heroOpacity, transform: [{ scale: heroScale }] }}>
          <GradientBackground colors={item.gradient} style={styles.hero}>
            <View style={styles.heroDecor} />
            <SlideVisual type={item.visual} accent={item.accent} />
          </GradientBackground>
        </Animated.View>

        <View style={styles.sheet}>
          <Text style={[styles.eyebrow, { color: item.accent }]}>{item.eyebrow}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.bullets}>
            {item.bullets.map((b) => (
              <View key={b} style={styles.bulletRow}>
                <View style={[styles.bulletIcon, { backgroundColor: `${item.accent}22` }]}>
                  <Ionicons name="checkmark" size={14} color={item.accent} />
                </View>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.topBar} edges={['top']}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity style={styles.skipBtn} onPress={finish} activeOpacity={0.8}>
          <Text style={styles.skipText}>{isLast ? 'Connexion' : 'Passer'}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
                backgroundColor: slides[currentIndex].accent,
              },
            ]}
          />
        </View>
        <Text style={styles.stepLabel}>
          {currentIndex + 1} / {slides.length}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <SafeAreaView style={styles.footer} edges={['bottom']}>
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: slides[currentIndex].accent }]}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>{isLast ? 'Commencer' : 'Continuer'}</Text>
          <Ionicons name={isLast ? 'log-in-outline' : 'arrow-forward'} size={20} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const visualStyles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  floatingCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    width: width * 0.78,
  },
  cardBack: {
    position: 'absolute',
    top: 24,
    left: 36,
    opacity: 0.55,
    transform: [{ scale: 0.92 }, { rotate: '-4deg' }],
    padding: 14,
    width: width * 0.55,
  },
  cardMain: {
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cardBadge: {
    color: 'rgba(248,250,252,0.7)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  cardTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  cardMeta: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  cardAmount: { color: '#F8FAFC', fontSize: 26, fontWeight: '800' },
  cardSub: { color: '#94A3B8', fontSize: 13, marginTop: 4, marginBottom: 14 },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  acceptText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  mapPin: {
    position: 'absolute',
    bottom: 32,
    right: 48,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackCard: { width: width * 0.82 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  liveText: { color: '#FCA5A5', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  timeline: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineStep: { alignItems: 'center', flex: 1 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 6,
  },
  timelineLabel: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  chatBubble: {
    position: 'absolute',
    bottom: 40,
    right: 56,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  earnCard: { width: width * 0.8 },
  earnLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  earnValue: { fontSize: 32, fontWeight: '800', marginVertical: 8 },
  earnBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 72,
    marginVertical: 12,
  },
  earnBar: { flex: 1, borderRadius: 6, minHeight: 8 },
  earnFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  earnFooterText: { color: '#CBD5E1', fontSize: 13, fontWeight: '600' },
  proofChip: {
    position: 'absolute',
    bottom: 48,
    left: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  proofText: { color: '#F8FAFC', fontSize: 12, fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DRIVER_COLORS.surface,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  progressWrap: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepLabel: {
    color: 'rgba(226,232,240,0.9)',
    fontSize: 12,
    fontWeight: '700',
    minWidth: 36,
  },
  slide: {
    flex: 1,
  },
  hero: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroDecor: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sheet: {
    flex: 1,
    backgroundColor: DRIVER_COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: DRIVER_COLORS.textOnLight,
    lineHeight: 34,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: DRIVER_COLORS.textSecondaryOnLight,
    marginBottom: 16,
  },
  bullets: { gap: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bulletIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: DRIVER_COLORS.surface,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

export default OnboardingScreen;
