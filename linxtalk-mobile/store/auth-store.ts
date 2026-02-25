import { create } from 'zustand';
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from 'expo-secure-store';
import { isTokenExpired } from '@/utils/fn-common';

const secureStoreAdapter = {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setIsHydrated: (isHydrated: boolean) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isHydrated: false,

            setTokens: (accessToken: string, refreshToken: string) => {
                set({ accessToken, refreshToken, isAuthenticated: true });
            },

            logout: () => {
                set({ accessToken: null, refreshToken: null, isAuthenticated: false });
            },

            setIsHydrated: (isHydrated: boolean) => {
                set({ isHydrated });
            },

            setIsAuthenticated: (isAuthenticated: boolean) => {
                set({ isAuthenticated });
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => secureStoreAdapter),
            onRehydrateStorage: () => {
                return (state, error) => {
                    if (!error && state) {
                        if (state.accessToken && state.refreshToken) {
                            state.setIsAuthenticated(!isTokenExpired(state.refreshToken));
                        }
                        state.setIsHydrated(true);
                    }
                };
            },
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    ));
