import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ONBOARDING_DATA = [
  {
    id: 1,
    title: 'Livraison rapide à Kinshasa',
    description: 'Commandez et recevez vos plats préférés en moins de 30 minutes',
    icon: 'bicycle-outline',
    color: COLORS.primary,
  },
  {
    id: 2,
    title: 'Restaurants, Épicerie & Plus',
    description: 'Des milliers de restaurants, épiceries, pharmacies et plus encore',
    icon: 'restaurant-outline',
    color: '#00A650',
  },
  {
    id: 3,
    title: 'Paiement sécurisé',
    description: 'Payez avec M-Pesa, Airtel Money, Orange Money ou en liquide',
    icon: 'card-outline',
    color: '#FF6B00',
  },
  {
    id: 4,
    title: 'Suivi en temps réel',
    description: 'Suivez votre livraison en direct sur la carte',
    icon: 'map-outline',
    color: COLORS.info,
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (address) {
          const locStr = `${address.street || ''}, ${address.city || 'Kinshasa'}`;
          setLocation(locStr);
          await AsyncStorage.setItem('user_location', JSON.stringify({
            latitude,
            longitude,
            address: locStr,
          }));
        }
      }
    } catch (err) {
      console.log('Location error', err);
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    navigation.replace('Auth');
  };

  const renderItem = ({ item, index }: { item: typeof ONBOARDING_DATA[0]; index: number }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={80} color={item.color} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      {index === ONBOARDING_DATA.length - 1 && location && (
        <View style={styles.locationBadge}>
          <Ionicons name="location" size={16} color={COLORS.primary} />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <FlatList
        data={ONBOARDING_DATA}
        renderItem={({ item, index }) => renderItem({ item, index })}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        {currentIndex === ONBOARDING_DATA.length - 1 ? (
          <TouchableOpacity style={styles.getStartedButton} onPress={handleFinish}>
            <Text style={styles.getStartedText}>Commencer</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              if (currentIndex < ONBOARDING_DATA.length - 1) {
                setCurrentIndex(currentIndex + 1);
              }
            }}
          >
            <Text style={styles.nextText}>Suivant</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  nextButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  nextText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  getStartedText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
