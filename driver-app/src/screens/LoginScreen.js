import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
    Image,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from "../services/api";
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { DRIVER_GRADIENTS } from '../theme/driverTheme';

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, showPassword, setShowPassword, colors, isDark, styles }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
            <Ionicons name={icon} size={20} color={isFocused ? colors.primary : colors.textMuted} style={styles.inputIcon} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={keyboardType || 'default'}
                autoCapitalize={autoCapitalize || 'none'}
                secureTextEntry={secureTextEntry && !showPassword}
                style={styles.input}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {secureTextEntry && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.textMuted}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const LoginScreen = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const { settings } = useSettings();

    const insets = useSafeAreaInsets();

    const { signIn } = useAuth();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    const handleLogin = async () => {
        if (!loginId.trim() || !password) {
            setError('Indiquez votre email ou téléphone et votre mot de passe');
            return;
        }

        setError('');
        setLoading(true);

        const result = await signIn(loginId.trim(), password);

        if (!result.success) {
            setError(result.error);
        }

        setLoading(false);
    };

    const gradientColors = isDark ? DRIVER_GRADIENTS.loginDark : DRIVER_GRADIENTS.loginLight;

    return (
        <LinearGradient
            colors={gradientColors}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.headerSection}>
                            <View style={styles.logoWrap}>
                                <Image source={settings?.app_logo ? { uri: settings.app_logo } : require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                            </View>
                            <Text style={styles.title}>C-FOOD Driver</Text>
                            <Text style={styles.subtitle}>Espace Livreur</Text>
                        </View>

                        <View style={styles.card}>
                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={18} color={colors.error} />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            <View style={styles.formContainer}>
                                <InputField
                                    icon="person-circle-outline"
                                    placeholder="Email ou téléphone"
                                    value={loginId}
                                    onChangeText={setLoginId}
                                    keyboardType="default"
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                    colors={colors}
                                    isDark={isDark}
                                    styles={styles}
                                />

                                <InputField
                                    icon="lock-closed-outline"
                                    placeholder="Mot de passe"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                    colors={colors}
                                    isDark={isDark}
                                    styles={styles}
                                />
                                
                                <Text style={styles.hintText}>
                                    Vos identifiants sont fournis par l'administration.
                                </Text>

                                <TouchableOpacity
                                    onPress={handleLogin}
                                    disabled={loading}
                                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.submitText}>Se connecter</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const getStyles = (colors, isDark) => StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoWrap: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.primary,
        letterSpacing: 0.5,
    },
    subtitle: {
        color: colors.textSecondary,
        marginTop: 6,
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 24,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDark ? 0.3 : 0.05,
        shadowRadius: 20,
        elevation: 8,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA'
    },
    errorText: {
        color: colors.error,
        marginLeft: 8,
        flex: 1,
        fontWeight: '500'
    },
    formContainer: {
        // marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? colors.surfaceSecondary : '#F8FAFC',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: isDark ? colors.border : '#F1F5F9',
    },
    inputContainerFocused: {
        borderColor: colors.primary,
        backgroundColor: isDark ? colors.background : '#F0F9FF',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    hintText: {
        color: colors.textMuted,
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});

export default LoginScreen;
