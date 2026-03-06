import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SavedAccount } from "@/constants/type";

interface AccountState {
    account: SavedAccount;
    isHydrated: boolean;
    setAccount: (account: SavedAccount) => void;
    clearAccount: () => void;
    setIsHydrated: (isHydrated: boolean) => void;
}

export const useAccountStore = create<AccountState>()(
    persist(
        (set) => ({
            account: {
                username: null,
                email: null,
                displayName: "",
                avatarUrl: null,
                phoneNumber: null,
                birthday: null,
                bio: null,
            },
            isHydrated: false,
            setAccount: (account: SavedAccount) => set({ account }),
            clearAccount: () => set({
                account: {
                    username: null,
                    email: null,
                    displayName: "",
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