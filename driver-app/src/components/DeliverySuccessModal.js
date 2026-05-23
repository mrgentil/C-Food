import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../utils/formatters';

const DeliverySuccessModal = ({ visible, onClose, orderTotal, colors, isDark }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;

    // Commission estimée à 10%
    const commission = (orderTotal || 0) * 0.1;
    const earnedText = formatPrice(commission);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 5,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.back(1.5)),
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            scaleAnim.setValue(0);
            fadeAnim.setValue(0);
            translateY.setValue(50);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(17, 28, 68, 0.85)' }]}>
                <Animated.View
                    style={[
                        styles.card,
                        {
                            backgroundColor: colors.surface,
                            opacity: fadeAnim,
                            transform: [{ translateY }]
                        }
                    ]}
                >
                    <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                        </View>
                    </Animated.View>

                    <Text style={[styles.title, { color: colors.text }]}>Bravo !</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Livraison effectuée avec succès.
                    </Text>

                    <View style={[styles.earningsBox, { backgroundColor: isDark ? 'rgba(14, 165, 233, 0.1)' : '#F0F9FF', borderColor: colors.primary }]}>
                        <Text style={[styles.earningsLabel, { color: colors.primary }]}>Gains estimés</Text>
                        <Text style={styles.earningsAmount}>{earnedText}</Text>
                        <Text style={[styles.earningsHint, { color: colors.textMuted }]}>Ajoutés à votre solde</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Retour à la carte</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    earningsBox: {
        width: '100%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
    },
    earningsLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    earningsAmount: {
        fontSize: 36,
        fontWeight: '900',
        color: '#10B981',
        marginBottom: 4,
    },
    earningsHint: {
        fontSize: 12,
    },
    button: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    }
});

export default DeliverySuccessModal;
