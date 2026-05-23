import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Alert } from 'react-native';
import { authService } from '../services/authService';
import { registerForPushNotificationsAsync } from '../utils/notificationHelper';
import { syncPushTokenToBackend } from '../services/pushService';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [driverProfile, setDriverProfile] = useState(null); // driver view of user
    const [loading, setLoading] = useState(true);

    const parseRating = (value) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    };

    const normalizeDriverProfile = (u) => {
        const fullName = (u?.name || '').trim();
        const parts = fullName ? fullName.split(' ') : [];
        const firstName = u?.firstName || parts[0] || '';
        const lastName = u?.lastName || parts.slice(1).join(' ') || '';
        const verificationStatus =
            u?.verificationStatus ?? u?.verification_status ?? u?.driver_verification_status ?? 'pending';
        const licenseUrl = u?.licenseUrl ?? u?.license_url ?? u?.driver_license_url ?? null;
        const insuranceUrl = u?.insuranceUrl ?? u?.insurance_url ?? u?.driver_insurance_url ?? null;
        const idUrl = u?.idUrl ?? u?.id_url ?? u?.driver_id_url ?? null;
        const documentsComplete =
            typeof u?.documentsComplete === 'boolean'
                ? u.documentsComplete
                : typeof u?.documents_complete === 'boolean'
                    ? u.documents_complete
                    : !!(licenseUrl && insuranceUrl);
        const approved = verificationStatus === 'approved';
        const canGoOnline =
            typeof u?.canGoOnline === 'boolean'
                ? u.canGoOnline
                : typeof u?.can_go_online === 'boolean'
                    ? u.can_go_online
                    : approved;
        return {
            ...u,
            firstName,
            lastName,
            vehicleType: u?.vehicleType || u?.vehicle_type,
            plateNumber: u?.plateNumber || u?.plate_number,
            photoURL: u?.photoURL || u?.photo,
            city: u?.city,
            phone: u?.phone,
            email: u?.email,
            rating: parseRating(u?.rating ?? u?.driver_rating),
            totalDeliveries: u?.totalDeliveries || u?.total_deliveries,
            isOnline: typeof u?.isOnline === 'boolean' ? u.isOnline : (typeof u?.is_online === 'boolean' ? u.is_online : false),
            verificationStatus,
            verificationLabel:
                u?.verificationLabel ??
                u?.verification_label ??
                (approved ? 'Vérifié' : verificationStatus === 'rejected' ? 'Refusé' : 'En attente'),
            verificationNote: u?.verificationNote ?? u?.verification_note ?? u?.driver_verification_note ?? null,
            canGoOnline,
            documentsComplete,
            licenseUrl,
            insuranceUrl,
            idUrl,
        };
    };

    const applyProfileFromApi = useCallback(async (p) => {
        if (!p) return;
        const normalized = normalizeDriverProfile(p);
        setDriverProfile((prev) => normalizeDriverProfile({ ...(prev || {}), ...normalized }));
        await authService.updateStoredUser({
            driver_verification_status: normalized.verificationStatus,
            driver_verification_note: normalized.verificationNote,
            driver_license_url: normalized.licenseUrl,
            driver_insurance_url: normalized.insuranceUrl,
            driver_id_url: normalized.idUrl,
            verification_status: normalized.verificationStatus,
            verification_label: normalized.verificationLabel,
            verification_note: normalized.verificationNote,
            can_go_online: normalized.canGoOnline,
            documents_complete: normalized.documentsComplete,
            license_url: normalized.licenseUrl,
            insurance_url: normalized.insuranceUrl,
            id_url: normalized.idUrl,
            is_online: normalized.isOnline,
            city: normalized.city,
            vehicle_type: normalized.vehicleType,
            plate_number: normalized.plateNumber,
        });
    }, []);

    useEffect(() => {
        const boot = async () => {
            try {
                const stored = await authService.getStoredUser();
                if (stored && stored.is_driver) {
                    setUser(stored);
                    setDriverProfile(normalizeDriverProfile(stored));

                    try {
                        const res = await api.get('/driver/profile');
                        const p = res?.data?.data;
                        if (p) await applyProfileFromApi(p);
                    } catch {
                        /* token expiré ou réseau — garde le cache local */
                    }

                    try {
                        const token = await registerForPushNotificationsAsync();
                        if (token) await syncPushTokenToBackend(token);
                    } catch {
                        /* ignore */
                    }
                } else {
                    setUser(null);
                    setDriverProfile(null);
                }
            } finally {
                setLoading(false);
            }
        };

        boot();
    }, [applyProfileFromApi]);

    // Connexion
    const signIn = async (login, password) => {
        try {
            const { user: apiUser } = await authService.login({ login, password });

            if (!apiUser?.is_driver) {
                await authService.logout();
                setUser(null);
                setDriverProfile(null);
                return { success: false, error: 'Accès réservé aux livreurs' };
            }

            setUser(apiUser);
            setDriverProfile(normalizeDriverProfile(apiUser));

            // Fetch server profile (city/vehicle/etc)
            try {
                const prof = await api.get('/driver/profile');
                const p = prof?.data?.data;
                if (p) await applyProfileFromApi(p);
            } catch {
                /* ignore */
            }

            try {
                const token = await registerForPushNotificationsAsync();
                if (token) await syncPushTokenToBackend(token);
            } catch {
                /* ignore */
            }

            return { success: true };
        } catch (error) {
            console.error('Erreur connexion:', error);
            return { success: false, error: 'Email ou mot de passe incorrect' };
        }
    };

    // Déconnexion
    const signOut = async () => {
        try {
            await authService.logout();
            setUser(null);
            setDriverProfile(null);
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        }
    };

    // Placeholder for refreshProfile, as it was included in the value object but not defined
    const refreshProfile = useCallback(async () => {
        try {
            const res = await api.get('/driver/profile');
            const p = res?.data?.data;
            if (p) {
                await applyProfileFromApi(p);
                return;
            }
        } catch {
            // ignore
        }
        const stored = await authService.getStoredUser();
        if (stored && stored.is_driver) {
            setUser(stored);
            setDriverProfile(normalizeDriverProfile(stored));
        }
    }, [applyProfileFromApi]);

    const toggleOnlineStatus = async () => {
        if (!driverProfile) return;
        const newStatus = !driverProfile.isOnline;

        if (newStatus && !driverProfile.canGoOnline) {
            const msg =
                driverProfile.verificationStatus === 'rejected'
                    ? (driverProfile.verificationNote || 'Compte refusé. Mettez à jour vos documents dans Mon véhicule.')
                    : !driverProfile.documentsComplete
                        ? 'Téléversez votre permis et votre assurance (Mon véhicule).'
                        : 'Votre dossier est en cours de vérification par l\'administration.';
            Alert.alert('Impossible', msg);
            return false;
        }

        setDriverProfile((prev) => ({ ...(prev || {}), isOnline: newStatus }));
        try {
            await api.put('/driver/profile', { is_online: newStatus });
            await refreshProfile();
            return true;
        } catch (e) {
            setDriverProfile((prev) => ({ ...(prev || {}), isOnline: !newStatus }));
            Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de changer le statut.');
            return false;
        }
    };

    const value = {
        user,
        driverProfile,
        loading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        refreshProfile,
        toggleOnlineStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
