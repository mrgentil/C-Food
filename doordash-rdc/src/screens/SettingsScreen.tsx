import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingsItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  type: 'navigation' | 'toggle';
  value?: boolean;
}

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [locationServices, setLocationServices] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('settings');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (typeof parsed.notifications === 'boolean') setNotifications(parsed.notifications);
        if (typeof parsed.locationServices === 'boolean') setLocationServices(parsed.locationServices);
        if (typeof parsed.darkMode === 'boolean') setDarkMode(parsed.darkMode);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const persist = async (next: { notifications: boolean; locationServices: boolean; darkMode: boolean }) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const settingsGroups = [
    {
      title: 'Compte',
      items: [
        { id: '1', icon: 'person-outline', title: 'Informations personnelles', subtitle: 'Modifier nom, email, téléphone', type: 'navigation' as const },
        { id: '2', icon: 'card-outline', title: 'Méthodes de paiement', subtitle: 'M-Pesa, Airtel Money, Cash', type: 'navigation' as const },
        { id: '3', icon: 'location-outline', title: 'Adresses enregistrées', subtitle: 'Gérer vos adresses', type: 'navigation' as const },
      ],
    },
    {
      title: 'Préférences',
      items: [
        { id: '4', icon: 'notifications-outline', title: 'Notifications', subtitle: 'Activer/désactiver', type: 'toggle' as const, value: notifications },
        { id: '5', icon: 'navigate-outline', title: 'Services de localisation', subtitle: 'Autoriser l\'accès', type: 'toggle' as const, value: locationServices },
        { id: '6', icon: 'moon-outline', title: 'Mode sombre', subtitle: 'Changer l\'apparence', type: 'toggle' as const, value: darkMode },
      ],
    },
    {
      title: 'Support',
      items: [
        { id: '7', icon: 'help-circle-outline', title: 'Aide & Support', subtitle: 'FAQ, contacter le support', type: 'navigation' as const },
        { id: '8', icon: 'document-text-outline', title: 'Conditions d\'utilisation', subtitle: 'Lire les conditions', type: 'navigation' as const },
        { id: '9', icon: 'shield-checkmark-outline', title: 'Politique de confidentialité', subtitle: 'Lire la politique', type: 'navigation' as const },
      ],
    },
  ];

  const handleToggle = (id: string, value: boolean) => {
    const next = {
      notifications: id === '4' ? value : notifications,
      locationServices: id === '5' ? value : locationServices,
      darkMode: id === '6' ? value : darkMode,
    };
    if (id === '4') setNotifications(value);
    if (id === '5') setLocationServices(value);
    if (id === '6') setDarkMode(value);
    persist(next);
  };

  const handleNavigation = (id: string) => {
    switch (id) {
      case '1': navigation.navigate('EditProfile'); break;
      case '2': navigation.navigate('PaymentMethods'); break;
      case '3': navigation.navigate('SavedPlaces'); break;
      case '7': navigation.navigate('HelpSupport'); break;
      case '8': break;
      case '9': break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsGroups.map(group => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingsItem}
                onPress={() => item.type === 'navigation' && handleNavigation(item.id)}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                </View>
                {item.type === 'navigation' ? (
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                ) : (
                  <Switch
                    value={item.value}
                    onValueChange={(value) => handleToggle(item.id, value)}
                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                    thumbColor={COLORS.background}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await logout();
              navigation.navigate('Auth' as any);
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
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
  group: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  groupTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  footer: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.lg,
  },
  version: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: '600',
  },
});
