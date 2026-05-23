import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../theme/driverTheme';

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme(); // 'light' or 'dark'
    
    // 'system', 'light', or 'dark'
    const [themeMode, setThemeMode] = useState('system');
    
    // The actual active colors (lightTheme or darkTheme)
    const [colors, setColors] = useState(lightTheme);
    const [isDark, setIsDark] = useState(false);

    // Load saved preference on boot
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('@driver_theme');
                if (savedTheme) {
                    setThemeMode(savedTheme);
                }
            } catch (e) {
                console.error("Erreur de chargement du thème", e);
            }
        };
        loadTheme();
    }, []);

    // Update colors whenever the mode or the system scheme changes
    useEffect(() => {
        let activeScheme = themeMode;
        if (themeMode === 'system') {
            activeScheme = systemColorScheme || 'light';
        }
        
        if (activeScheme === 'dark') {
            setColors(darkTheme);
            setIsDark(true);
        } else {
            setColors(lightTheme);
            setIsDark(false);
        }
    }, [themeMode, systemColorScheme]);

    // Change theme mode and save to storage
    const changeTheme = async (mode) => {
        setThemeMode(mode);
        try {
            await AsyncStorage.setItem('@driver_theme', mode);
        } catch (e) {
            console.error("Erreur de sauvegarde du thème", e);
        }
    };

    return (
        <ThemeContext.Provider value={{ colors, isDark, themeMode, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
