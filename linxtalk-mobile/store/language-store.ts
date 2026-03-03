import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';
import * as Localization from 'expo-localization';

const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';

interface LanguageState {
    language: string;
    isHydrated: boolean;
    setLanguage: (language: string) => void;
    setIsHydrated: (isHydrated: boolean) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: deviceLocale,
            isHydrated: false,

            setLanguage: (language: string) => {
                i18n.changeLanguage(language);
                set({ language });
            },

            setIsHydrated: (isHydrated: boolean) => {
                set({ isHydrated });
            },
        }),
        {
            name: 'language-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => {
                return (state, error) => {
                    if (!error && state) {
                        i18n.changeLanguage(state.language);
                        state.setIsHydrated(true);
                    }
                };
            },
            partialize: (state) => ({
                language: state.language,
            }),
        }
    )
);
