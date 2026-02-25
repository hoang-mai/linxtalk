import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedAccount } from '@/constants/type';

interface SavedAccountState {
    savedAccounts: SavedAccount[];
    isHydrated: boolean;
    isSavedAccount: boolean;
    saveAccount: (account: SavedAccount) => void;
    removeAccount: (username: string) => void;
    setIsSavedAccount: (isSavedAccount: boolean) => void;
    setIsHydrated: (isHydrated: boolean) => void;
}

export const useSavedAccountStore = create<SavedAccountState>()(
    persist(
        (set, get) => ({
            savedAccounts: [],
            isHydrated: false,
            isSavedAccount: false,

            saveAccount: (account) => {
                const { savedAccounts } = get();
                const filtered = savedAccounts.filter(
                    (a) => a.username !== account.username
                );
                const newAccount: SavedAccount = {
                    username: account.username,
                    displayName: account.displayName,
                    avatarUrl: account.avatarUrl ?? null,
                };
                set({
                    savedAccounts: [
                        newAccount,
                        ...filtered,
                    ],
                });
                set({ isSavedAccount: true });
            },

            removeAccount: (username) => {
                const { savedAccounts } = get();
                set({
                    savedAccounts: savedAccounts.filter(
                        (a) => a.username !== username
                    ),
                });
                if (get().savedAccounts.length === 0) {
                    set({ isSavedAccount: false });
                }
            },

            setIsSavedAccount: (isSavedAccount: boolean) => {
                set({ isSavedAccount });
            },

            setIsHydrated: (isHydrated: boolean) => {
                set({ isHydrated });
            },
        }),
        {
            name: 'saved-accounts-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => {
                return (state) => {
                    if (state) {
                        state.setIsSavedAccount(state.savedAccounts.length > 0);
                        state.setIsHydrated(true);
                    }
                };
            },
            partialize: (state) => ({
                savedAccounts: state.savedAccounts,
            }),
        }
    )
);
