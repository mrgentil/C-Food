import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { passService } from '../services/passService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "Qu'est-ce que CFoodPass ?",
    answer: "CFoodPass est un abonnement qui vous donne accès à la livraison gratuite sur toutes vos commandes éligibles.",
  },
  {
    question: 'Comment annuler mon abonnement ?',
    answer: 'Vous pouvez annuler votre abonnement à tout moment dans les paramètres de votre compte.',
  },
  {
    question: 'La livraison est-elle vraiment gratuite ?',
    answer: 'Oui, la livraison est gratuite pour les commandes éligibles lorsque votre CFoodPass est actif.',
  },
  {
    question: 'Puis-je partager mon CFoodPass ?',
    answer: "Non, CFoodPass est personnel et ne peut pas être partagé avec d'autres utilisateurs.",
  },
];

export default function DashPassScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, refreshUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const isSubscribed = useMemo(() => !!user?.dash_pass, [user?.dash_pass]);
  const expiresLabel = useMemo(() => {
    const raw = (user as any)?.dash_pass_expires_at;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('fr-FR');
  }, [user]);

  const benefits = [
    {
      icon: 'bicycle',
      title: 'Livraison gratuite',
      description: 'Sur toutes les commandes éligibles sans frais de livraison',
    },
    {
      icon: 'pricetag',
      title: 'Réductions exclusives',
      description: 'Accédez à des offres spéciales et réductions membres',
    },
    {
      icon: 'headset',
      title: 'Support prioritaire',
      description: 'Assistance client dédiée et prioritaire 7j/7',
    },
  ];

  const handleSubscribe = () => {
    if (isSubscribed) {
      Alert.alert(
        'CFoodPass',
        'Vous êtes déjà abonné à CFoodPass !',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Connexion requise', 'Connectez-vous pour activer CFoodPass.');
      return;
    }

    Alert.alert(
      "S'abonner à CFoodPass",
      'Voulez-vous activer CFoodPass pour 5000 FC / 30 jours ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'S\'abonner',
          onPress: async () => {
            try {
              setLoading(true);
              await passService.subscribe(30);
              await refreshUser();
              Alert.alert('Succès', 'Vous êtes maintenant abonné à CFoodPass !');
            } catch (err: any) {
              Alert.alert('Erreur', err.response?.data?.message || err.message || "Impossible d'activer CFoodPass");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    if (!isAuthenticated) return;
    Alert.alert('Annuler CFoodPass', 'Voulez-vous annuler votre abonnement ?', [
      { text: 'Retour', style: 'cancel' },
      {
        text: 'Annuler',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await passService.cancel();
            await refreshUser();
            Alert.alert('OK', 'CFoodPass a été annulé.');
          } catch (err: any) {
            Alert.alert('Erreur', err.response?.data?.message || err.message || "Impossible d'annuler CFoodPass");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={'#FFF'} />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="star" size={48} color={'#FFF'} />
            </View>
            <Text style={styles.heroTitle}>CFoodPass</Text>
            <Text style={styles.heroSubtitle}>
              Livraison gratuite sur vos commandes préférées
            </Text>
          </View>
        </View>

        {/* Subscription Status */}
        {isSubscribed && (
          <View style={styles.subscribedBanner}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            <Text style={styles.subscribedText}>
              CFoodPass actif{expiresLabel ? ` · expire le ${expiresLabel}` : ''}
            </Text>
          </View>
        )}

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Avantages CFoodPass</Text>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Ionicons name={benefit.icon as any} size={28} color={COLORS.primary} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <View style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <Text style={styles.priceLabel}>Mensuel</Text>
              {isSubscribed && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIF</Text>
                </View>
              )}
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>5000</Text>
              <Text style={styles.priceCurrency}>FC</Text>
              <Text style={styles.pricePeriod}>/mois</Text>
            </View>
            <View style={styles.priceFeatures}>
              <View style={styles.priceFeature}>
                <Ionicons name="checkmark" size={16} color={COLORS.success} />
                <Text style={styles.priceFeatureText}>Livraison gratuite</Text>
              </View>
              <View style={styles.priceFeature}>
                <Ionicons name="checkmark" size={16} color={COLORS.success} />
                <Text style={styles.priceFeatureText}>Réductions exclusives</Text>
              </View>
              <View style={styles.priceFeature}>
                <Ionicons name="checkmark" size={16} color={COLORS.success} />
                <Text style={styles.priceFeatureText}>Support prioritaire</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subscribe Button */}
        <View style={styles.subscribeSection}>
          <TouchableOpacity
            style={[styles.subscribeButton, (isSubscribed || loading) && styles.subscribeButtonDisabled]}
            onPress={handleSubscribe}
            disabled={isSubscribed || loading}
          >
            <Text style={styles.subscribeButtonText}>
              {loading ? 'Traitement...' : isSubscribed ? 'Déjà abonné' : "S'abonner maintenant"}
            </Text>
          </TouchableOpacity>
          {isSubscribed ? (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={loading}>
              <Text style={styles.cancelButtonText}>Annuler l’abonnement</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.subscribeNote}>
              Annulez à tout moment. Pas d'engagement.
            </Text>
          )}
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          {FAQ_DATA.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => toggleFAQ(index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Ionicons
                  name={expandedFAQ === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </View>
              {expandedFAQ === index && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  subscribedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '15',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  subscribedText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.success,
  },
  benefitsSection: {
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  benefitDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  pricingSection: {
    padding: SPACING.md,
  },
  priceCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  priceLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
  },
  activeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#FFF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.lg,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceCurrency: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  pricePeriod: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  priceFeatures: {
    gap: SPACING.sm,
  },
  priceFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  priceFeatureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  subscribeSection: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    width: '100%',
    alignItems: 'center',
  },
  subscribeButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  subscribeButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#FFF',
  },
  subscribeNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  cancelButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  faqSection: {
    padding: SPACING.md,
  },
  faqItem: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  faqQuestion: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  faqAnswer: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: SPACING.xxl * 2,
  },
});
