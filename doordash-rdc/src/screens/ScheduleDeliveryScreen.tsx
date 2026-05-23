import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
];

const DATES = [
  { label: 'Aujourd\'hui', value: '2026-04-30' },
  { label: 'Demain', value: '2026-05-01' },
  { label: 'Apr 2', value: '2026-05-02' },
  { label: 'Apr 3', value: '2026-05-03' },
];

export default function ScheduleDeliveryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedDate, setSelectedDate] = useState('2026-04-30');
  const [selectedTime, setSelectedTime] = useState('');

  const handleConfirm = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Programmer la livraison</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir une date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesContainer}>
            {DATES.map(date => (
              <TouchableOpacity
                key={date.value}
                style={[styles.dateChip, selectedDate === date.value && styles.dateChipActive]}
                onPress={() => setSelectedDate(date.value)}
              >
                <Text style={[styles.dateText, selectedDate === date.value && styles.dateTextActive]}>
                  {date.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir un créneau</Text>
          <View style={styles.timeSlots}>
            {TIME_SLOTS.map(slot => (
              <TouchableOpacity
                key={slot}
                style={[styles.timeSlot, selectedTime === slot && styles.timeSlotActive]}
                onPress={() => setSelectedTime(slot)}
              >
                <Text style={[styles.timeText, selectedTime === slot && styles.timeTextActive]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Les livraisons programmées peuvent prendre plus de temps que prévu
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, !selectedTime && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!selectedTime}
        >
          <Text style={styles.confirmButtonText}>Confirmer le créneau</Text>
        </TouchableOpacity>
      </View>
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
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  datesContainer: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  dateChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dateChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  dateTextActive: {
    color: COLORS.background,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeSlot: {
    width: '48%',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  timeSlotActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  timeTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.info + '10',
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  confirmButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
