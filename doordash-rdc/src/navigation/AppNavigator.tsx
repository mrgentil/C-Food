import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HomeScreen,
  SearchScreen,
  OrdersScreen,
  ProfileScreen,
  RestaurantScreen,
  ItemDetailScreen,
  CartScreen,
  OrderTrackingScreen,
  CheckoutScreen,
  AuthScreen,
  OrderPlacedScreen,
  CategoryDetailScreen,
  DealsScreen,
  DashPassScreen,
  EditProfileScreen,
  SavedPlacesScreen,
  PaymentMethodsScreen,
  NotificationsScreen,
  OrderRatingScreen,
  ScheduleDeliveryScreen,
  GroupOrderScreen,
  HelpSupportScreen,
  SettingsScreen,
  OrderHistoryScreen,
  OrderDetailScreen,
  StoreListScreen,
  GroceryScreen,
  GroceryDetailScreen,
  AlcoholScreen,
  AlcoholDetailScreen,
  FlowersScreen,
  FlowersDetailScreen,
  PharmacyScreen,
  PharmacyDetailScreen,
  PetStoreScreen,
  PetStoreDetailScreen,
  AdvancedFilterScreen,
  MapViewScreen,
  DriverChatScreen,
  ChangePasswordScreen,
  FavoritesScreen,
  PromoCodesScreen,
  PromoDetailScreen,
  NotificationSettingsScreen,
  LanguageSettingsScreen,
  DeleteAccountScreen,
  OnboardingScreen,
  AdminDashboardScreen,
  AdminOrdersScreen,
  AdminOrderDetailScreen,
  AdminUsersScreen,
  AdminRestaurantsScreen,
  SplashScreen,
} from '../screens';
import type { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Explorer' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Commandes' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [splashAnimationDone, setSplashAnimationDone] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      // 🛠️ POUR LES TESTS : Décommentez la ligne suivante pour réinitialiser l'onboarding à chaque démarrage :
      // await AsyncStorage.removeItem('onboarding_completed');
      const completed = await AsyncStorage.getItem('onboarding_completed');
      setHasCompletedOnboarding(completed === 'true');
    } catch {
      setHasCompletedOnboarding(false);
    }
  };

  const isReady = hasCompletedOnboarding !== null && !authLoading;

  const resolveInitialRoute = (): keyof RootStackParamList => {
    if (!hasCompletedOnboarding) return 'Onboarding';
    if (isAuthenticated) return 'Main';
    return 'Auth';
  };

  useEffect(() => {
    if (!isReady || isAuthenticated) return;
    navigationRef.current?.reset({
      index: 0,
      routes: [{ name: hasCompletedOnboarding ? 'Auth' : 'Onboarding' }],
    });
  }, [isAuthenticated, isReady, hasCompletedOnboarding]);

  if (!splashAnimationDone) {
    return (
      <SplashScreen
        isAppReady={isReady}
        onFinish={() => setSplashAnimationDone(true)}
      />
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={resolveInitialRoute()}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen
          name="Restaurant"
          component={RestaurantScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="ItemDetail"
          component={ItemDetailScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="OrderPlaced" component={OrderPlacedScreen} />
        <Stack.Screen
          name="CategoryDetail"
          component={CategoryDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen name="Deals" component={DealsScreen} />
        <Stack.Screen name="DashPass" component={DashPassScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="OrderRating" component={OrderRatingScreen} />
        <Stack.Screen name="ScheduleDelivery" component={ScheduleDeliveryScreen} />
        <Stack.Screen name="GroupOrder" component={GroupOrderScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen name="StoreList" component={StoreListScreen} />
        <Stack.Screen name="Grocery" component={GroceryScreen} />
        <Stack.Screen name="GroceryDetail" component={GroceryDetailScreen} />
        <Stack.Screen name="Alcohol" component={AlcoholScreen} />
        <Stack.Screen name="AlcoholDetail" component={AlcoholDetailScreen} />
        <Stack.Screen name="Flowers" component={FlowersScreen} />
        <Stack.Screen name="FlowersDetail" component={FlowersDetailScreen} />
        <Stack.Screen name="Pharmacy" component={PharmacyScreen} />
        <Stack.Screen name="PharmacyDetail" component={PharmacyDetailScreen} />
        <Stack.Screen name="PetStore" component={PetStoreScreen} />
        <Stack.Screen name="PetStoreDetail" component={PetStoreDetailScreen} />
        <Stack.Screen name="AdvancedFilter" component={AdvancedFilterScreen} />
        <Stack.Screen name="MapView" component={MapViewScreen} />
        <Stack.Screen name="DriverChat" component={DriverChatScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="PromoCodes" component={PromoCodesScreen} />
        <Stack.Screen name="PromoDetail" component={PromoDetailScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
        <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
        <Stack.Screen
          name="AdminOrderDetail"
          component={AdminOrderDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
        <Stack.Screen name="AdminRestaurants" component={AdminRestaurantsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
