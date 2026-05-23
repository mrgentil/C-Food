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
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, showPassword, setShowPassword }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
            <Ionicons name={icon} size={20} color={isFocused ? "#0EA5E9" : "#94A3B8"} style={styles.inputIcon} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
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
                        color="#94A3B8"
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

    const { signIn } = useAuth();

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

    return (
        <LinearGradient
            colors={['#F0F9FF', '#E0F2FE', '#FFFFFF']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <StatusBar style="dark" />
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
                                <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                            </View>
                            <Text style={styles.title}>C-FOOD Driver</Text>
                            <Text style={styles.subtitle}>Espace Livreur</Text>
                        </View>

                        <View style={styles.card}>
                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={18} color="#EF4444" />
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
                                />

                                <InputField
                                    icon="lock-closed-outline"
                                    placeholder="Mot de passe"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
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

const styles = StyleSheet.create({
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
        color: '#0284C7',
        letterSpacing: 0.5,
    },
    subtitle: {
        color: '#64748B',
        marginTop: 6,
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 8,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FECACA'
    },
    errorText: {
        color: '#EF4444',
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
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
    },
    inputContainerFocused: {
        borderColor: '#0EA5E9',
        backgroundColor: '#F0F9FF',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
        fontWeight: '500',
    },
    hintText: {
        color: '#94A3B8',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#0EA5E9',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#0EA5E9',
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
