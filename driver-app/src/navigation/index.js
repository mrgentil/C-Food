import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { DRIVER_COLORS } from "../theme/driverTheme";

import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import DriverTabs from "./DriverTabs";
import OrdersDeliveryScreen from "../screens/OrderDelivery";
import ChatScreen from "../screens/ChatScreen";
import WalletScreen from "../screens/WalletScreen";
import VehicleScreen from "../screens/VehicleScreen";
import EditProfileScreen from "../screens/EditProfileScreen";

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: DRIVER_COLORS.dark }}>
        <ActivityIndicator size="large" color={DRIVER_COLORS.primary} />
      </View>
    );
  }


  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="DriverTabs" component={DriverTabs} />
          <Stack.Screen name="OrdersScreen" component={DriverTabs} options={{ animation: "none" }} />
          <Stack.Screen
            name="OrdersDeliveryScreen"
            component={OrdersDeliveryScreen}
            options={{ presentation: "card" }}
          />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="Vehicle" component={VehicleScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          {/* Dev only — Revoir l'onboarding depuis le profil */}
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Navigation;
