import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { isDriverApp } from '../config/appVariant';

const SHADOWS = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};

const SHADOWS_LG = {
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 6,
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export default function AuthScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigation.replace('Main');
    }
  }, [authLoading, isAuthenticated, navigation]);

  const handleSubmit = async () => {
    setError('');

    const loginMode = isDriverApp || isLogin;

    if (!loginMode && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (loginMode) {
      if (!loginId.trim() || !password) {
        setError('Indiquez votre email ou téléphone et votre mot de passe');
        return;
      }
    } else if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      if (loginMode) {
        await login({ login: loginId.trim(), password });
        Alert.alert('Bienvenue!', 'Connexion réussie', [{ text: 'OK', onPress: () => navigation.replace('Main') }]);
      } else {
        await register({ name, email, phone, password, password_confirmation: confirmPassword });
        Alert.alert('Compte créé!', 'Inscription réussie', [{ text: 'OK', onPress: () => navigation.replace('Main') }]);
      }
    } catch (err: any) {
      let errorMsg = 'Une erreur est survenue';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMsg = Object.values(err.response.data.errors).flat().join('\n');
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      Alert.alert('Erreur', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loginMode = isDriverApp || isLogin;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name={isDriverApp ? 'bicycle' : 'restaurant'} size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>C-Food</Text>
            <Text style={styles.tagline}>
              {isDriverApp ? 'Espace livreur — connexion' : 'Livraison rapide à Kinshasa'}
            </Text>
          </View>

          {!isDriverApp && (
            <View style={styles.toggleContainer}>
              <TouchableOpacity style={[styles.toggle, isLogin && styles.toggleActive]} onPress={() => setIsLogin(true)}>
                <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Connexion</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggle, !isLogin && styles.toggleActive]} onPress={() => setIsLogin(false)}>
                <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Inscription</Text>
              </TouchableOpacity>
            </View>
          )}

          {isDriverApp ? <Text style={styles.screenTitle}>Connexion</Text> : null}

          <View style={styles.form}>
            {!loginMode && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Nom complet"
                  placeholderTextColor={COLORS.textLight}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            {loginMode ? (
              <View style={styles.inputContainer}>
                <Ionicons name="person-circle-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Email ou numéro de téléphone"
                  placeholderTextColor={COLORS.textLight}
                  value={loginId}
                  onChangeText={setLoginId}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoComplete="username"
                />
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Adresse email"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}

            {!loginMode && (
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Numéro de téléphone"
                  placeholderTextColor={COLORS.textLight}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {!loginMode && (
              <View style={styles.inputContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmer le mot de passe"
                  placeholderTextColor={COLORS.textLight}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            )}

            {loginMode && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Mot de passe oublié?</Text>
              </TouchableOpacity>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>{loginMode ? 'Se connecter' : 'Créer un compte'}</Text>
              )}
            </TouchableOpacity>

            {!isDriverApp && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => Alert.alert('Bientôt disponible', 'La connexion avec Google sera disponible prochainement.')}
                  >
                    <Ionicons name="logo-google" size={24} color={COLORS.text} />
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => Alert.alert('Bientôt disponible', 'La connexion avec Apple sera disponible prochainement.')}
                  >
                    <Ionicons name="logo-apple" size={24} color={COLORS.text} />
                    <Text style={styles.socialButtonText}>Apple</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  screenTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginBottom: SPACING.xl,
  },
  toggle: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  toggleActive: {
    backgroundColor: COLORS.background,
    ...SHADOWS,
  },
  toggleText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.primary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS_LG,
    marginBottom: SPACING.lg,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  socialButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
});
