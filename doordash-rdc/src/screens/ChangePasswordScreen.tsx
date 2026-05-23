import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import api from '../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ChangePasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Tous les champs sont requis');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      Alert.alert('Succès', 'Mot de passe modifié avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join('\n')
        : 'Erreur lors du changement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Changer le mot de passe</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe actuel"
            placeholderTextColor={COLORS.textLight}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrent}
          />
          <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
            <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Nouveau mot de passe"
            placeholderTextColor={COLORS.textLight}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Confirmer le nouveau mot de passe"
            placeholderTextColor={COLORS.textLight}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Changer le mot de passe</Text>}
        </TouchableOpacity>
      </View>
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
  form: { padding: SPACING.lg, gap: SPACING.md },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm,
  },
  input: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  submitButton: {
    backgroundColor: COLORS.primary, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md, alignItems: 'center', marginTop: SPACING.lg,
  },
  submitButtonText: { color: '#FFF', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  submitButtonDisabled: { opacity: 0.7 },
  errorText: { color: COLORS.error, fontSize: FONT_SIZES.sm, textAlign: 'center' },
});
