import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, TextInput, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HelpItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

const HELP_ITEMS: HelpItem[] = [
  { id: '1', icon: 'receipt-outline', title: 'Problème avec une commande', subtitle: 'Livraison, articles manquants...' },
  { id: '2', icon: 'card-outline', title: 'Problème de paiement', subtitle: 'Remboursement, double facturation...' },
  { id: '3', icon: 'person-outline', title: 'Problème avec le livreur', subtitle: 'Comportement, retard...' },
  { id: '4', icon: 'restaurant-outline', title: 'Problème avec le restaurant', subtitle: 'Qualité, erreur de commande...' },
  { id: '5', icon: 'bug-outline', title: 'Signaler un bug', subtitle: 'Problème technique avec l\'app' },
  { id: '6', icon: 'chatbubble-outline', title: 'Chat en direct', subtitle: 'Discutez avec notre équipe' },
];

export default function HelpSupportScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedHelpId, setSelectedHelpId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const selectedHelp = useMemo(
    () => HELP_ITEMS.find((x) => x.id === selectedHelpId) ?? null,
    [selectedHelpId]
  );

  const openCall = async () => {
    const phone = '+243123456789';
    const url = `tel:${phone}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir l'appel.");
    }
  };

  const openEmail = async () => {
    const email = 'support@c-food.com';
    const subject = encodeURIComponent(selectedHelp?.title ?? 'Support');
    const body = encodeURIComponent(message.trim());
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir l'email.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Aide & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment pouvons-nous vous aider ?</Text>
          {HELP_ITEMS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.helpItem, selectedHelpId === item.id && styles.helpItemSelected]}
              onPress={() => setSelectedHelpId(selectedHelpId === item.id ? null : item.id)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>{item.title}</Text>
                <Text style={styles.helpSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons
                name={selectedHelpId === item.id ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          ))}
        </View>

        {selectedHelp ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Décrivez votre problème</Text>
            <View style={styles.composeCard}>
              <View style={styles.composeHeader}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.composeTitle}>{selectedHelp.title}</Text>
              </View>
              <TextInput
                style={styles.composeInput}
                placeholder="Expliquez en quelques lignes… (commande, restaurant, etc.)"
                placeholderTextColor={COLORS.textLight}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
              <View style={styles.composeActions}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={openEmail}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.secondaryBtnText}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={openCall}>
                  <Ionicons name="call-outline" size={18} color={'#FFF'} />
                  <Text style={styles.primaryBtnText}>Appeler</Text>
                </TouchableOpacity>
              </View>
              {Platform.OS === 'web' ? (
                <Text style={styles.note}>Note: sur le web, les liens tel/mail peuvent dépendre du navigateur.</Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoCard}>
            <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Numéro d'urgence</Text>
              <Text style={styles.infoValue}>+243 123 456 789</Text>
            </View>
            <TouchableOpacity onPress={openCall}>
              <Text style={styles.linkText}>Appeler</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>support@c-food.com</Text>
            </View>
            <TouchableOpacity onPress={openEmail}>
              <Text style={styles.linkText}>Écrire</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Heures d'ouverture</Text>
              <Text style={styles.infoValue}>24h/24, 7j/7</Text>
            </View>
          </View>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>FAQ</Text>
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Comment suivre ma commande ?</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Comment annuler une commande ?</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Quels sont les frais de livraison ?</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  helpItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  helpSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  linkText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  faqSection: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  faqQuestion: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  composeCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  composeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  composeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  composeInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    minHeight: 120,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  composeActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
  },
  note: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
});
