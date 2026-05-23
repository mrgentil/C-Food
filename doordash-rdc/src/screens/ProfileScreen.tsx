import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { getUserAvatarUri } from '../utils/resolveUserPhotoUrl';
import type { RootStackParamList } from '../navigation/types';

const SHADOWS = {
  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screen: keyof RootStackParamList;
  color?: string;
  isDestructive?: boolean;
}

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout: authLogout, refreshUser } = useAuth();
  const [orderCount, setOrderCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [refreshUser])
  );

  useEffect(() => {
    fetchOrderCount();
  }, []);

  const fetchOrderCount = async () => {
    try {
      const res = await orderService.getAll();
      const orders = res.data?.data;
      setOrderCount(Array.isArray(orders) ? orders.length : 0);
    } catch (err) {
      setOrderCount(0);
    }
  };

  const menuItems: MenuItem[] = [
    { icon: 'person-outline', label: 'Modifier le profil', screen: 'EditProfile' },
    { icon: 'heart-outline', label: 'Favoris', screen: 'Favorites' },
    { icon: 'location-outline', label: 'Adresses de livraison', screen: 'SavedPlaces' },
    { icon: 'card-outline', label: 'Méthodes de paiement', screen: 'PaymentMethods' },
    { icon: 'pricetags-outline', label: 'Promotions et codes', screen: 'PromoCodes' },
    { icon: 'lock-closed-outline', label: 'Changer le mot de passe', screen: 'ChangePassword' },
    { icon: 'notifications-outline', label: 'Notifications', screen: 'NotificationSettings' },
    { icon: 'language-outline', label: 'Langue', screen: 'LanguageSettings' },
    { icon: 'help-circle-outline', label: 'Aide et support', screen: 'HelpSupport' },
    { icon: 'settings-outline', label: 'Paramètres', screen: 'Settings' },
    ...(user?.is_admin ? [{ icon: 'speedometer-outline' as const, label: 'Panel Admin', screen: 'AdminDashboard' as const, color: COLORS.primary }] : []),
    { icon: 'document-text-outline', label: 'Conditions d\'utilisation', screen: 'HelpSupport' },
    { icon: 'shield-checkmark-outline', label: 'Politique de confidentialité', screen: 'HelpSupport' },
    { icon: 'trash-outline', label: 'Supprimer le compte', screen: 'DeleteAccount', isDestructive: true },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: async () => {
          await authLogout();
          navigation.navigate('Auth' as any);
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: getUserAvatarUri(user?.photo) }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name || 'Utilisateur'}</Text>
        <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orderCount}</Text>
          <Text style={styles.statLabel}>Commandes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>4.8</Text>
          <Text style={styles.statLabel}>Note moy.</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Favoris</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen as never)}
          >
            <View style={[styles.iconContainer, item.color && { backgroundColor: item.color + '20' }]}>
              <Ionicons
                name={item.icon}
                size={22}
                color={item.isDestructive ? COLORS.error : item.color || COLORS.textSecondary}
              />
            </View>
            <Text style={[styles.menuLabel, item.isDestructive && { color: COLORS.error }]}>
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        ))}

        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Paiements rapides</Text>
          <View style={styles.paymentMethods}>
            <View style={styles.paymentMethod}>
              <Ionicons name="phone-portrait-outline" size={24} color="#4CAF50" />
              <Text style={styles.paymentName}>M-Pesa</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Ionicons name="phone-portrait-outline" size={24} color="#E53935" />
              <Text style={styles.paymentName}>Airtel Money</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Ionicons name="phone-portrait-outline" size={24} color="#FF9800" />
              <Text style={styles.paymentName}>Orange Money</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Ionicons name="cash-outline" size={24} color={COLORS.textSecondary} />
              <Text style={styles.paymentName}>Cash</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutButton, { marginTop: SPACING.md, backgroundColor: COLORS.backgroundSecondary, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border }]} onPress={() => navigation.navigate('Onboarding' as never)}>
          <Ionicons name="phone-portrait-outline" size={22} color={COLORS.primary} />
          <Text style={[styles.logoutText, { color: COLORS.primary }]}>Revoir l'Onboarding (Dev)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>C-Food Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    alignItems: 'center', paddingVertical: SPACING.xl,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: SPACING.md, borderWidth: 3, borderColor: COLORS.primary },
  name: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  email: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  stats: {
    flexDirection: 'row', backgroundColor: COLORS.backgroundSecondary,
    margin: SPACING.md, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, ...SHADOWS,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  statLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  menu: { flex: 1 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.md,
  },
  iconContainer: {
    width: 40, height: 40, borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  menuLabel: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  paymentSection: { marginTop: SPACING.lg, padding: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  paymentMethods: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  paymentMethod: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, gap: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  paymentName: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.text },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: SPACING.xl, padding: SPACING.md, gap: SPACING.sm,
  },
  logoutText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.error },
  version: { textAlign: 'center', fontSize: FONT_SIZES.sm, color: '#636366', marginBottom: SPACING.xl },
});
