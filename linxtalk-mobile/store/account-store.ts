import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Account } from "@/constants/type";

interface AccountState {
    account: Account;
    isHydrated: boolean;
    setAccount: (account: Account) => void;
    clearAccount: () => void;
    setIsHydrated: (isHydrated: boolean) => void;
}

export const useAccountStore = create<AccountState>()(
    persist(
        (set) => ({
            account: {
                username: null,
                email: null,
                displayName: null,
                avatarUrl: null,
            },
            isHydrated: false,
            setAccount: (account: Account) => set({ account }),
            clearAccount: () => set({
                account: {
                    username: null,
                    email: null,
                    displayName: null,
                    avatarUrl: null,
                }
            }),
            setIsHydrated: (isHydrated: boolean) => set({ isHydrated }),
        }),
        {
            name: "account-storage",
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => {
                return (state) => {
                    if (state) {
                        state.setIsHydrated(true);
                    }
                };
            },
            partialize: (state) => ({
                account: state.account,
            }),
        }
    )
);