import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LANGUAGES = [
  { code: 'fr', name: 'Français', native: 'Français' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'ln', name: 'Lingala', native: 'Lingála' },
];

export default function LanguageSettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedLang, setSelectedLang] = useState('fr');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Langue</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.langRow, selectedLang === lang.code && styles.langRowSelected]}
            onPress={() => setSelectedLang(lang.code)}
          >
            <View style={styles.langLeft}>
              <Text style={[styles.langNative, selectedLang === lang.code && styles.langNativeSelected]}>{lang.native}</Text>
              <Text style={styles.langName}>{lang.name}</Text>
            </View>
            {selectedLang === lang.code && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
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
  content: { padding: SPACING.md },
  langRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.lg, marginBottom: SPACING.xs,
    borderWidth: 1, borderColor: 'transparent',
  },
  langRowSelected: { borderColor: COLORS.primary },
  langLeft: { gap: 2 },
  langNative: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text },
  langNativeSelected: { color: COLORS.primary },
  langName: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
});
