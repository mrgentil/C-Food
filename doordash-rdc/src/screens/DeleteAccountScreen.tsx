import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DeleteAccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('Auth' as any);
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de supprimer le compte');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supprimer le compte</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warning}>
          <Ionicons name="warning" size={48} color={COLORS.error} />
          <Text style={styles.warningTitle}>Attention</Text>
          <Text style={styles.warningText}>
            La suppression de votre compte est irréversible. Vous perdrez :
          </Text>
          <Text style={styles.warningItem}>• Votre historique de commandes</Text>
          <Text style={styles.warningItem}>• Vos adresses sauvegardées</Text>
          <Text style={styles.warningItem}>• Vos favoris</Text>
          <Text style={styles.warningItem}>• Vos codes promo non utilisés</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Confirmez votre mot de passe"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Text style={styles.label}>Raison (optionnel)</Text>
          <View style={styles.textareaContainer}>
            <TextInput
              style={styles.textarea}
              placeholder="Pourquoi souhaitez-vous supprimer votre compte ?"
              placeholderTextColor={COLORS.textLight}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#FFF" />
            <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
          </TouchableOpacity>
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
  content: { padding: SPACING.lg },
  warning: {
    alignItems: 'center', backgroundColor: COLORS.error + '10',
    borderRadius: BORDER_RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.xl,
  },
  warningTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.error, marginTop: SPACING.md },
  warningText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
  warningItem: { fontSize: FONT_SIZES.md, color: COLORS.text, marginTop: SPACING.xs },
  form: { gap: SPACING.lg },
  label: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm,
  },
  input: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  textareaContainer: {
    backgroundColor: COLORS.backgroundSecondary, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  textarea: { fontSize: FONT_SIZES.md, color: COLORS.text, minHeight: 100 },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.error, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md, gap: SPACING.sm, marginTop: SPACING.lg,
  },
  deleteButtonText: { color: '#FFF', fontSize: FONT_SIZES.lg, fontWeight: '700' },
});
