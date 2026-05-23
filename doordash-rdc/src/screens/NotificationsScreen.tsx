import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'promo' | 'system';
  read: boolean;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Commande en cours de livraison',
    message: 'Votre commande chez Chez Mama K est en route',
    time: 'Il y a 5 min',
    type: 'order',
    read: false,
  },
  {
    id: '2',
    title: 'Offre spéciale !',
    message: '-20% sur votre prochaine commande avec le code BIENVENUE',
    time: 'Il y a 2 heures',
    type: 'promo',
    read: false,
  },
  {
    id: '3',
    title: 'Commande livrée',
    message: 'Votre commande #001 a été livrée. Bon appétit !',
    time: 'Hier',
    type: 'order',
    read: true,
  },
  {
    id: '4',
    title: 'Mise à jour système',
    message: 'Nouvelles fonctionnalités disponibles dans l\'app',
    time: 'Il y a 3 jours',
    type: 'system',
    read: true,
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return 'receipt-outline';
      case 'promo': return 'pricetag-outline';
      default: return 'information-circle-outline';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'order': return COLORS.primary;
      case 'promo': return COLORS.warning;
      default: return COLORS.info;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Tout marquer lu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {SAMPLE_NOTIFICATIONS.map(notification => (
          <View
            key={notification.id}
            style={[styles.notificationCard, !notification.read && styles.unreadCard]}
          >
            <View style={[styles.iconContainer, { backgroundColor: getIconColor(notification.type) + '20' }]}>
              <Ionicons name={getIcon(notification.type)} size={24} color={getIconColor(notification.type)} />
            </View>
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
          </View>
        ))}
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
  markAllRead: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  unreadCard: {
    backgroundColor: COLORS.primary + '08',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});
