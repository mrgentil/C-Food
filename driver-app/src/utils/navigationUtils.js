import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to a specific route
 */
export function navigate(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    } else {
        console.log("🚀 [NavigationUtils] Ref not ready, queuing navigation to:", name);
    }
}

/** Ouvre un onglet du menu principal (Courses, Gains, Historique, Compte). */
export function navigateToTab(tabName, params) {
    if (!navigationRef.isReady()) return;
    navigationRef.navigate('DriverTabs', { screen: tabName, params });
}

/**
 * Go back to previous screen
 */
export function goBack() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
        navigationRef.goBack();
    }
}

/**
 * Reset navigation state
 */
export function reset(state) {
    if (navigationRef.isReady()) {
        navigationRef.reset(state);
    }
}
