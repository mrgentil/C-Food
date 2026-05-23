import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { config } from '../config';
import * as navigationUtils from '../utils/navigationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { formatPrice } from '../utils/formatters';

function formatRating(rating) {
    const n = Number(rating);
    if (!Number.isFinite(n)) {
        return '5.0';
    }
    return n.toFixed(1);
}

const ProfileScreen = ({ navigation, route }) => {
    const tabRoot = route?.params?.tabRoot;
    const { driverProfile, signOut, refreshProfile } = useAuth();
    const { colors, isDark, themeMode, changeTheme } = useTheme();
    const styles = getStyles(colors, isDark);

    const [uploading, setUploading] = useState(false);
    const [monthlyEarnings, setMonthlyEarnings] = useState('0 FC');

    const loadEarnings = useCallback(async () => {
        if (!driverProfile?.id) return;
        try {
            const res = await api.get('/driver/wallet');
            const balance = res?.data?.data?.balance;
            if (balance != null) {
                setMonthlyEarnings(formatPrice(balance));
            }
        } catch {
            /* ignore */
        }
    }, [driverProfile?.id]);

    useEffect(() => {
        loadEarnings();
    }, [loadEarnings]);

    useFocusEffect(
        useCallback(() => {
            refreshProfile();
        }, [refreshProfile])
    );

    const stats = [
        { label: 'Livraisons', value: driverProfile?.totalDeliveries || 0, icon: '📦' },
        { label: 'Note', value: formatRating(driverProfile?.rating), icon: '⭐' },
        { label: 'Gains', value: monthlyEarnings, icon: '💰' },
    ];

    const openSupport = () => {
        const phone = config.SUPPORT_PHONE;
        const email = config.SUPPORT_EMAIL;
        Alert.alert(
            'Aide et support',
            `Besoin d'aide ?\n\n📞 ${phone}\n✉️ ${email}`,
            [
                {
                    text: 'Appeler',
                    onPress: () => Linking.openURL(`tel:${phone}`).catch(() => {
                        Alert.alert('Erreur', 'Impossible d\'ouvrir l\'appel.');
                    }),
                },
                {
                    text: 'E-mail',
                    onPress: () =>
                        Linking.openURL(
                            `mailto:${email}?subject=${encodeURIComponent('Support livreur C-Food')}`
                        ).catch(() => {
                            Alert.alert('Erreur', 'Impossible d\'ouvrir l\'e-mail.');
                        }),
                },
                { text: 'Fermer', style: 'cancel' },
            ]
        );
    };

    const menuItems = [
        {
            icon: 'person-outline',
            label: 'Modifier mon profil',
            onPress: () => navigationUtils.navigate('EditProfile'),
        },
        {
            icon: 'car-outline',
            label: 'Mon véhicule',
            subtitle: driverProfile?.vehicleType === 'moto' ? '🛵 Moto' : driverProfile?.vehicleType === 'bike' ? '🚲 Vélo' : '🚗 Voiture',
            onPress: () => navigationUtils.navigate('Vehicle'),
        },
        {
            icon: 'location-outline',
            label: 'Ma zone de livraison',
            subtitle: `📍 ${driverProfile?.city || 'Kinshasa'}`,
            onPress: () => navigationUtils.navigate('EditProfile'),
        },
        {
            icon: 'document-text-outline',
            label: 'Historique des livraisons',
            onPress: () => navigationUtils.navigateToTab('History'),
        },
        {
            icon: 'wallet-outline',
            label: 'Mes gains',
            onPress: () => navigationUtils.navigateToTab('Earnings'),
        },
        {
            icon: 'help-circle-outline',
            label: 'Aide et support',
            onPress: openSupport,
        },
    ];

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Voulez-vous vraiment vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: signOut,
                },
            ]
        );
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Désolé', 'Nous avons besoin de la permission pour accéder à vos photos !');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets?.length > 0) {
                uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error in pickImage:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de l\'image.');
        }
    };

    const uploadImage = async (uri) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', { uri, type: 'image/jpeg', name: 'profile.jpg' });
            formData.append('upload_preset', config.CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'driver-avatars');

            const response = await fetch(config.CLOUDINARY_URL, {
                method: 'POST',
                body: formData,
                headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
            });

            const data = await response.json();

            if (data.secure_url) {
                await api.put('/driver/profile', { photo: data.secure_url });
                await refreshProfile();
                Alert.alert('Succès', 'Votre photo de profil a été mise à jour !');
            } else {
                throw new Error('Cloudinary upload failed');
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            Alert.alert('Erreur', 'Impossible de mettre à jour la photo.');
        } finally {
            setUploading(false);
        }
    };

    const isOnline = !!driverProfile?.isOnline;
    const vStatus = driverProfile?.verificationStatus || 'pending';
    const verificationBannerStyle =
        vStatus === 'approved'
            ? styles.vBannerOk
            : vStatus === 'rejected'
                ? styles.vBannerErr
                : styles.vBannerWait;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <View style={styles.header}>
                {!tabRoot ? (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
                <Text style={styles.headerTitle}>Mon compte</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.vBanner, verificationBannerStyle]}>
                    <Text style={styles.vBannerTitle}>
                        {driverProfile?.verificationLabel || 'En attente'}
                    </Text>
                    {driverProfile?.verificationNote ? (
                        <Text style={styles.vBannerSub}>{driverProfile.verificationNote}</Text>
                    ) : null}
                    {!driverProfile?.documentsComplete && vStatus !== 'approved' ? (
                        <Text style={styles.vBannerSub}>
                            Ajoutez permis et assurance dans Mon véhicule.
                        </Text>
                    ) : null}
                </View>

                <View style={styles.profileCard}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} disabled={uploading}>
                        {driverProfile?.photoURL ? (
                            <Image source={{ uri: driverProfile.photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {driverProfile?.firstName?.[0] || 'L'}
                                </Text>
                            </View>
                        )}

                        {uploading && (
                            <View style={[styles.avatar, styles.loadingOverlay]}>
                                <ActivityIndicator size="large" color="white" />
                            </View>
                        )}

                        {!uploading && (
                            <View style={styles.editBadge}>
                                <Ionicons name="camera" size={14} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.name}>
                        {driverProfile?.firstName || ''} {driverProfile?.lastName || ''}
                    </Text>
                    <Text style={styles.email}>{driverProfile?.email}</Text>

                    <View style={styles.badgesRow}>
                        <View style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}>
                            <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
                            <Text style={[styles.statusText, isOnline ? styles.statusTextOnline : styles.statusTextOffline]}>
                                {isOnline ? 'En ligne' : 'Hors ligne'}
                            </Text>
                        </View>
                        {vStatus === 'approved' && (
                            <View style={[styles.statusBadge, styles.statusVerified]}>
                                <Ionicons name="shield-checkmark" size={14} color="#166534" />
                                <Text style={styles.statusTextVerified}>Vérifié</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.statItem}
                            disabled={stat.label !== 'Gains'}
                            onPress={() => stat.label === 'Gains' && navigationUtils.navigateToTab('Earnings')}
                        >
                            <Text style={styles.statEmoji}>{stat.icon}</Text>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuIcon}>
                                <Ionicons name={item.icon} size={22} color={colors.primary} />
                            </View>
                            <View style={styles.menuText}>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                {item.subtitle ? (
                                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                ) : null}
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Theme Selector Section */}
                <Text style={styles.sectionTitle}>Apparence</Text>
                <View style={styles.themeSelectorContainer}>
                    <TouchableOpacity
                        style={[styles.themeBtn, themeMode === 'light' && styles.themeBtnActive]}
                        onPress={() => changeTheme('light')}
                    >
                        <Ionicons name="sunny" size={20} color={themeMode === 'light' ? colors.primary : colors.textMuted} />
                        <Text style={[styles.themeBtnText, themeMode === 'light' && styles.themeBtnTextActive]}>Clair</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.themeBtn, themeMode === 'dark' && styles.themeBtnActive]}
                        onPress={() => changeTheme('dark')}
                    >
                        <Ionicons name="moon" size={20} color={themeMode === 'dark' ? colors.primary : colors.textMuted} />
                        <Text style={[styles.themeBtnText, themeMode === 'dark' && styles.themeBtnTextActive]}>Sombre</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.themeBtn, themeMode === 'system' && styles.themeBtnActive]}
                        onPress={() => changeTheme('system')}
                    >
                        <Ionicons name="phone-portrait-outline" size={20} color={themeMode === 'system' ? colors.primary : colors.textMuted} />
                        <Text style={[styles.themeBtnText, themeMode === 'system' && styles.themeBtnTextActive]}>Auto</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color={colors.error} />
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>

                <Text style={styles.version}>C-Food Driver · Version {Constants.expoConfig?.version || '1.0.0'}</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    vBanner: { marginHorizontal: 16, marginTop: 8, marginBottom: 0, borderRadius: 14, padding: 14 },
    vBannerOk: { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.2)' : '#DCFCE7' },
    vBannerWait: { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' },
    vBannerErr: { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' },
    vBannerTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
    vBannerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
    badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    statusVerified: { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.2)' : '#DCFCE7' },
    statusTextVerified: { color: isDark ? '#4ADE80' : '#166534', fontWeight: '600', fontSize: 13, marginLeft: 4 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.navBar,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    profileCard: {
        backgroundColor: colors.surface,
        margin: 16,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
    },
    avatarText: { fontSize: 40, fontWeight: '700', color: 'white' },
    editBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.surface,
    },
    name: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 4 },
    email: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusOnline: { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' },
    statusOffline: { backgroundColor: colors.surfaceSecondary },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    dotOnline: { backgroundColor: '#10B981' },
    dotOffline: { backgroundColor: colors.textMuted },
    statusText: { fontWeight: '600', fontSize: 13 },
    statusTextOnline: { color: isDark ? '#34D399' : '#10B981' },
    statusTextOffline: { color: colors.textSecondary },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statEmoji: { fontSize: 28, marginBottom: 4 },
    statValue: { fontSize: 18, fontWeight: '700', color: colors.text },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    menuContainer: {
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: isDark ? colors.surfaceSecondary : '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: { flex: 1 },
    menuLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
    menuSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    
    sectionTitle: {
        marginLeft: 24,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
    },
    themeSelectorContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 8,
        marginBottom: 24,
        justifyContent: 'space-between',
    },
    themeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    themeBtnActive: {
        backgroundColor: isDark ? colors.surfaceSecondary : '#F0F9FF',
    },
    themeBtnText: {
        color: colors.textMuted,
        fontWeight: '600',
        fontSize: 14,
    },
    themeBtnTextActive: {
        color: colors.primary,
    },
    
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    logoutText: { color: colors.error, fontWeight: '600', fontSize: 16, marginLeft: 8 },
    version: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginBottom: 32 },
});

export default ProfileScreen;
