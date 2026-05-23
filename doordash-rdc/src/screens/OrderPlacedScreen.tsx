import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';

const SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 3,
};

const SHADOWS_LG = {
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 6,
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'OrderPlaced'>;

export default function OrderPlacedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const orderId = route.params?.orderId;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
        </View>
        <Text style={styles.title}>Commande confirmée!</Text>
        <Text style={styles.subtitle}>
          Votre commande a été passée avec succès. Le restaurant prépare votre repas.
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="time-outline" size={24} color={COLORS.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Temps estimé</Text>
            <Text style={styles.infoText}>25-35 minutes</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="receipt-outline" size={24} color={COLORS.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Numéro de commande</Text>
            <Text style={styles.infoText}>#DD-{Math.floor(Math.random() * 10000)}</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => (orderId ? navigation.navigate('OrderTracking', { orderId }) : navigation.navigate('Orders'))}
          >
            <Ionicons name="location-outline" size={20} color="#FFF" />
            <Text style={styles.trackButtonText}>Suivre ma commande</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    width: '100%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  buttons: {
    width: '100%',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  trackButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS_LG,
  },
  trackButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  homeButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  homeButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});

