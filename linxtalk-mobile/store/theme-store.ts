import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    theme: ThemeMode;
    isHydrated: boolean;
    setTheme: (theme: ThemeMode) => void;
    setIsHydrated: (isHydrated: boolean) => void;
}

const applyTheme = (theme: ThemeMode) => {
    if (theme === 'system') {
        Appearance.setColorScheme(null);
    } else {
        Appearance.setColorScheme(theme);
    }
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'system',
            isHydrated: false,

            setTheme: (theme: ThemeMode) => {
                applyTheme(theme);
                set({ theme });
            },

            setIsHydrated: (isHydrated: boolean) => {
                set({ isHydrated });
            },
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => {
                return (state, error) => {
                    if (!error && state) {
                        applyTheme(state.theme);
                        state.setIsHydrated(true);
                    }
                };
            },
            partialize: (state) => ({
                theme: state.theme,
            }),
        }
    )
);
