import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function NotificationSettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoNotifs, setPromoNotifs] = useState(true);
  const [driverMsg, setDriverMsg] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [smsNotifs, setSmsNotifs] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Général</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.rowLabel}>Notifications push</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor="#FFF" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commandes</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="receipt-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.rowLabel}>Mises à jour des commandes</Text>
            </View>
            <Switch value={orderUpdates} onValueChange={setOrderUpdates} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor="#FFF" />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="car-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.rowLabel}>Messages du livreur</Text>
            </View>
            <Switch value={driverMsg} onValueChange={setDriverMsg} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor="#FFF" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="gift-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.rowLabel}>Promotions et offres</Text>
            </View>
            <Switch value={promoNotifs} onValueChange={setPromoNotifs} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor="#FFF" />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="mail-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.rowLabel}>Notifications par email</Text>
            </View>
            <Switch value={emailNotifs} onValueChange={setEmailNotifs} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor="#FFF" />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="chatbubble-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.rowLabel}>Notifications par SMS</Text>
            </View>
            <Switch value={smsNotifs} onValueChange={setSmsNotifs} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor="#FFF" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  headerRight: { width: 40 },
  section: { marginTop: SPACING.lg, paddingHorizontal: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 1 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, marginBottom: SPACING.xs,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  rowLabel: { fontSize: FONT_SIZES.md, color: COLORS.text },
});
