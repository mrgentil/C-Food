import "react-native-gesture-handler";
import "./src/tasks/locationTask";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./src/utils/navigationUtils";

import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Navigation from "./src/navigation";
import { AuthProvider } from "./src/contexts/AuthContext";
import { NotificationProvider } from "./src/contexts/NotificationContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { SettingsProvider } from "./src/contexts/SettingsContext";
import api from "./src/services/api";
import { View, Text, LogBox } from "react-native";

// Expo Go (SDK 53+) : push Android non supporté — évite la bannière rouge bloquante
LogBox.ignoreLogs([
  'expo-notifications',
  'Android Push notifications',
]);

// Navigation ref moved to utils/navigationUtils.js


// 🛡️ Error Boundary personnalisé (car les composants fonctionnels ne le supportent pas encore)
class MyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 [CRASH-JS]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFF' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>Oups ! Une erreur est survenue.</Text>
          <Text style={{ color: '#666', textAlign: 'center' }}>{this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    // 🔍 SUIVI DE DÉMARRAGE (Debug)
    const trackStartup = async () => {
      try {
        console.log("🚀 [App-Driver] Heartbeat sending...");
        await api.post("/driver/debug/startup", {
          platform: "ios",
          version: "1.0.0",
          build: "8",
          timestamp: new Date().toISOString()
        });
        console.log("✅ [App-Driver] Heartbeat SENT");
      } catch (e) {
        if (e?.response?.status !== 404) {
          console.log("❌ [App-Driver] Heartbeat failed", e.message);
        }
      }
    };

    trackStartup();

    if (Constants.appOwnership !== 'expo') {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
      } catch (e) {
        console.warn('[Push] Notifications désactivées:', e?.message);
      }
    }
  }, []);

  const ErrorFallback = ({ error }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFF' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>Oups ! Une erreur est survenue.</Text>
      <Text style={{ color: '#666', textAlign: 'center' }}>{error.message}</Text>
    </View>
  );

  return (
    <MyErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer ref={navigationRef}>
          <SafeAreaProvider>
            <SettingsProvider>
              <ThemeProvider>
                <AuthProvider>
                  <NotificationProvider navigationRef={navigationRef}>
                    <Navigation />
                    {/* StatusBar handled per screen or dynamically inside */}
                  </NotificationProvider>
                </AuthProvider>
              </ThemeProvider>
            </SettingsProvider>
          </SafeAreaProvider>
        </NavigationContainer>
      </GestureHandlerRootView>
    </MyErrorBoundary>
  );
}
