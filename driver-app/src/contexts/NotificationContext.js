import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';
import InAppNotification from '../components/InAppNotification';
import * as navigationUtils from '../utils/navigationUtils';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children, navigationRef }) => {
    const { driverProfile, refreshProfile, isAuthenticated } = useAuth();
    const [notification, setNotification] = useState(null);
    const [visible, setVisible] = useState(false);
    const lastSeenTimestamps = useRef(new Map());

    const handleVerificationPush = async (content) => {
        await refreshProfile();
        setNotification({
            title: content?.title || 'Vérification livreur',
            message: content?.body || '',
            verification: true,
            icon: content?.data?.status === 'approved' ? 'shield-checkmark' : 'alert-circle',
        });
        setVisible(true);
    };

    useEffect(() => {
        if (!isAuthenticated || !driverProfile?.id) return;
        if (Constants.appOwnership === 'expo') return;

        const onReceived = Notifications.addNotificationReceivedListener((event) => {
            const data = event.request.content.data || {};
            if (data.type === 'driver_verification') {
                handleVerificationPush(event.request.content);
            }
        });

        const onResponse = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data || {};
            if (data.type === 'driver_verification') {
                refreshProfile();
                navigationUtils.navigate('Vehicle');
            } else if (data.orderId && navigationRef?.current) {
                navigationRef.current.navigate('ChatScreen', {
                    orderId: data.orderId,
                    clientName: data.clientName || 'Client',
                    clientId: data.clientId,
                });
            }
        });

        return () => {
            onReceived.remove();
            onResponse.remove();
        };
    }, [isAuthenticated, driverProfile?.id]);

    const handlePress = () => {
        setVisible(false);
        if (notification?.verification) {
            navigationUtils.navigate('Vehicle');
            return;
        }
        if (notification && navigationRef?.current) {
            navigationRef.current.navigate('ChatScreen', {
                orderId: notification.orderId,
                clientName: `${notification.userFirstName || ''} ${notification.userLastName || ''}`.trim() || 'Client',
                clientId: notification.userId,
            });
        }
    };

    return (
        <NotificationContext.Provider value={{ setNotification, setVisible, lastSeenTimestamps }}>
            {children}
            <InAppNotification
                visible={visible}
                notification={notification}
                onHide={() => setVisible(false)}
                onPress={handlePress}
            />
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
